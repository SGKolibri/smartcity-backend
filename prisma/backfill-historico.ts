/**
 * Backfill de histórico de telemetria e eventos do sensor 360°.
 *
 * O simulador (Fase 2) só gera dados dali pra frente; este script preenche as
 * últimas semanas para que os endpoints de histórico e KPIs (Fases 3 e 4)
 * tenham o que responder. É destrutivo APENAS para `LeituraTelemetria` e
 * `EventoSensor` — os postes e seus status não são tocados.
 *
 *   bun run db:backfill            # 30 dias, passo de 20 min
 *   DIAS=45 RESOLUCAO_MIN=15 bun run db:backfill
 */
import {
  PrismaClient,
  Prisma,
  SentidoVeiculo,
  StatusPoste,
  TipoEventoSensor,
} from '@prisma/client';
import {
  FATOR_CONSUMO_ALTO_MAX,
  FATOR_CONSUMO_ALTO_MIN,
  LUMINOSIDADE_PICO_PCT,
  LUMINOSIDADE_PISO_PCT,
  POTENCIA_NOMINAL_KW,
} from '../src/common/constants';

const prisma = new PrismaClient();

const DIAS = Number(process.env.DIAS) || 30;
const RESOLUCAO_MIN = Number(process.env.RESOLUCAO_MIN) || 20;
const DIAS_COM_EVENTOS = 3; // log do sensor só interessa recente
const PROB_PICO = 0.15; // fração das leituras noturnas com veículo presente
const LOTE = 10_000;

const HORA_LIGA = 18; // 18h–6h: iluminação pública ligada
const HORA_DESLIGA = 6;

const entre = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const noturno = (d: Date): boolean => {
  const h = d.getHours();
  return h >= HORA_LIGA || h < HORA_DESLIGA;
};

async function inserirEmLotes<T>(
  linhas: T[],
  gravar: (lote: T[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < linhas.length; i += LOTE) {
    await gravar(linhas.slice(i, i + LOTE));
  }
}

async function main(): Promise<void> {
  const postes = await prisma.poste.findMany({
    select: { id: true, status: true },
  });
  if (!postes.length) {
    throw new Error('Nenhum poste no banco. Rode `bun run db:seed` antes.');
  }

  const agora = new Date();
  const inicio = new Date(agora.getTime() - DIAS * 24 * 60 * 60_000);
  const passoMs = RESOLUCAO_MIN * 60_000;
  const corteEventos = new Date(
    agora.getTime() - DIAS_COM_EVENTOS * 24 * 60 * 60_000,
  );

  console.log(
    `Backfill: ${postes.length} postes · ${DIAS} dias · passo ${RESOLUCAO_MIN} min`,
  );

  await prisma.eventoSensor.deleteMany();
  await prisma.leituraTelemetria.deleteMany();

  const leituras: Prisma.LeituraTelemetriaCreateManyInput[] = [];
  const eventos: Prisma.EventoSensorCreateManyInput[] = [];

  for (const poste of postes) {
    const fatorAlto =
      poste.status === StatusPoste.CONSUMO_ALTO
        ? entre(FATOR_CONSUMO_ALTO_MIN, FATOR_CONSUMO_ALTO_MAX)
        : 1;

    // Postes hoje em falha/manutenção operavam normalmente até pararem de
    // reportar: telemetria histórica normal, cortada nesse instante.
    const paraDeReportarEm =
      poste.status === StatusPoste.FALHA_OFFLINE
        ? agora.getTime() - entre(40, 320) * 60_000
        : poste.status === StatusPoste.MANUTENCAO
          ? agora.getTime() - entre(6, 40) * 60 * 60_000
          : Infinity;

    for (let t = inicio.getTime(); t <= agora.getTime(); t += passoMs) {
      if (t >= paraDeReportarEm) break;
      const ts = new Date(t);
      const ligado = noturno(ts);

      let luminosidadePct = 0;
      let consumoKw = 0;

      if (ligado) {
        const pico = Math.random() < PROB_PICO;
        luminosidadePct = pico ? LUMINOSIDADE_PICO_PCT : LUMINOSIDADE_PISO_PCT;
        const base =
          POTENCIA_NOMINAL_KW * (luminosidadePct / 100) * entre(0.92, 1.08);
        consumoKw = Number((base * fatorAlto).toFixed(4));

        if (pico && ts >= corteEventos) {
          const sentido =
            Math.random() < 0.5
              ? SentidoVeiculo.APROXIMANDO
              : SentidoVeiculo.AFASTANDO;
          eventos.push({
            posteId: poste.id,
            timestamp: ts,
            tipo: TipoEventoSensor.VEICULO_DETECTADO,
            sentido,
            luminosidadeResultante: LUMINOSIDADE_PICO_PCT,
          });
          eventos.push({
            posteId: poste.id,
            timestamp: new Date(t + entre(8_000, 22_000)),
            tipo: TipoEventoSensor.RETORNO_AO_PISO,
            sentido:
              sentido === SentidoVeiculo.APROXIMANDO
                ? SentidoVeiculo.AFASTANDO
                : SentidoVeiculo.APROXIMANDO,
            luminosidadeResultante: LUMINOSIDADE_PISO_PCT,
          });
        }
      }

      leituras.push({
        posteId: poste.id,
        timestamp: ts,
        consumoKw,
        luminosidadePct,
      });
    }
  }

  await inserirEmLotes(leituras, (lote) =>
    prisma.leituraTelemetria.createMany({ data: lote }),
  );
  await inserirEmLotes(eventos, (lote) =>
    prisma.eventoSensor.createMany({ data: lote }),
  );

  console.log(
    `Backfill concluído: ${leituras.length} leituras, ${eventos.length} eventos.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
