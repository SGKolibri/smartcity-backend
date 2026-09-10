/**
 * Backfill de histórico:
 *  - `LeituraTelemetria` + `EventoSensor` dos últimos `DIAS_RAW` dias, para o
 *    detalhe do poste (Fase 3);
 *  - `AgregadoConsumo` diário (por poste + rede) de `DIAS_AGREGADO` dias, para
 *    os KPIs do dashboard (Fase 4) — inclusive o ano anterior, para a variação.
 *
 * Destrutivo APENAS para essas três tabelas; os postes não são tocados.
 *
 *   bun run db:backfill
 *   DIAS_RAW=45 DIAS_AGREGADO=800 bun run db:backfill
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
  KWH_DIA_POSTE_NORMAL,
  LUMINOSIDADE_PICO_PCT,
  LUMINOSIDADE_PISO_PCT,
  POTENCIA_NOMINAL_KW,
  TARIFA_B4A_KWH,
} from '../src/common/constants';

const prisma = new PrismaClient();

const DIAS_RAW = Number(process.env.DIAS_RAW) || 30;
const DIAS_AGREGADO = Number(process.env.DIAS_AGREGADO) || 740;
const RESOLUCAO_MIN = Number(process.env.RESOLUCAO_MIN) || 20;
const DIAS_COM_EVENTOS = 3;
const PROB_PICO = 0.15;
const LOTE = 10_000;
const MS_DIA = 24 * 60 * 60_000;

const entre = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const inicioDiaUtc = (ms: number): number => {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

const custo = (kwh: number): number =>
  Number((kwh * TARIFA_B4A_KWH).toFixed(4));

function linhaAgregado(
  posteId: string | null,
  diaMs: number,
  kwh: number,
): Prisma.AgregadoConsumoCreateManyInput {
  return {
    posteId,
    periodo: 'DIA',
    periodoInicio: new Date(diaMs),
    periodoFim: new Date(diaMs + MS_DIA),
    consumoTotalKwh: Number(kwh.toFixed(4)),
    custoTotalReais: custo(kwh),
  };
}

async function inserirEmLotes<T>(
  linhas: T[],
  gravar: (lote: T[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < linhas.length; i += LOTE) {
    await gravar(linhas.slice(i, i + LOTE));
  }
}

/** Fator sazonal + de dia da semana + tendência para o consumo diário sintético. */
function fatorDia(diaMs: number, diasAtras: number): number {
  const data = new Date(diaMs);
  const diaDoAno = Math.floor(
    (diaMs - Date.UTC(data.getUTCFullYear(), 0, 0)) / MS_DIA,
  );
  const sazonal = 1 + 0.08 * Math.cos((2 * Math.PI * (diaDoAno - 172)) / 365);
  const fimDeSemana = data.getUTCDay() === 0 || data.getUTCDay() === 6;
  const semana = fimDeSemana ? 0.97 : 1;
  const tendencia = 1 + 0.06 * (diasAtras / DIAS_AGREGADO);
  return sazonal * semana * tendencia * entre(0.96, 1.04);
}

async function main(): Promise<void> {
  const postes = await prisma.poste.findMany({
    select: { id: true, status: true },
  });
  if (!postes.length) {
    throw new Error('Nenhum poste no banco. Rode `bun run db:seed` antes.');
  }

  const agora = Date.now();
  const passoMs = RESOLUCAO_MIN * 60_000;
  const hojeUtc = inicioDiaUtc(agora);
  const inicioRaw = hojeUtc - (DIAS_RAW - 1) * MS_DIA; // meia-noite UTC
  const corteEventos = agora - DIAS_COM_EVENTOS * MS_DIA;

  console.log(
    `Backfill: ${postes.length} postes · telemetria ${DIAS_RAW}d · agregados ${DIAS_AGREGADO}d`,
  );

  await prisma.agregadoConsumo.deleteMany();
  await prisma.eventoSensor.deleteMany();
  await prisma.leituraTelemetria.deleteMany();

  const leituras: Prisma.LeituraTelemetriaCreateManyInput[] = [];
  const eventos: Prisma.EventoSensorCreateManyInput[] = [];
  const agregados: Prisma.AgregadoConsumoCreateManyInput[] = [];

  // kWh por dia UTC → poste, acumulado das leituras brutas e dos sintéticos.
  const kwhRawPorDia = new Map<number, Map<string, number>>();
  const kwhSinteticoRede = new Map<number, number>();

  for (const poste of postes) {
    const fatorAlto =
      poste.status === StatusPoste.CONSUMO_ALTO
        ? entre(FATOR_CONSUMO_ALTO_MIN, FATOR_CONSUMO_ALTO_MAX)
        : 1;

    // Postes hoje em falha/manutenção pararam de reportar há pouco.
    const paraDeReportarEm =
      poste.status === StatusPoste.FALHA_OFFLINE
        ? agora - entre(40, 320) * 60_000
        : poste.status === StatusPoste.MANUTENCAO
          ? agora - entre(6, 40) * 60 * 60_000
          : Infinity;

    // --- Telemetria bruta: operação contínua (piso 50%, picos por veículo) ---
    for (let t = inicioRaw; t <= agora; t += passoMs) {
      if (t >= paraDeReportarEm) break;
      const pico = Math.random() < PROB_PICO;
      const luminosidadePct = pico
        ? LUMINOSIDADE_PICO_PCT
        : LUMINOSIDADE_PISO_PCT;
      const consumoKw = Number(
        (
          POTENCIA_NOMINAL_KW *
          (luminosidadePct / 100) *
          entre(0.92, 1.08) *
          fatorAlto
        ).toFixed(4),
      );

      leituras.push({
        posteId: poste.id,
        timestamp: new Date(t),
        consumoKw,
        luminosidadePct,
      });

      const dia = inicioDiaUtc(t);
      let doDia = kwhRawPorDia.get(dia);
      if (!doDia) kwhRawPorDia.set(dia, (doDia = new Map()));
      doDia.set(
        poste.id,
        (doDia.get(poste.id) ?? 0) + (consumoKw * RESOLUCAO_MIN) / 60,
      );

      if (pico && t >= corteEventos) {
        const sentido =
          Math.random() < 0.5
            ? SentidoVeiculo.APROXIMANDO
            : SentidoVeiculo.AFASTANDO;
        eventos.push({
          posteId: poste.id,
          timestamp: new Date(t),
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

    // --- Agregado diário sintético dos dias anteriores à telemetria bruta ---
    for (let d = 1; d <= DIAS_AGREGADO; d++) {
      const diaMs = hojeUtc - d * MS_DIA;
      if (diaMs >= inicioRaw) continue;
      const kwh = KWH_DIA_POSTE_NORMAL * fatorAlto * fatorDia(diaMs, d);
      agregados.push(linhaAgregado(poste.id, diaMs, kwh));
      kwhSinteticoRede.set(diaMs, (kwhSinteticoRede.get(diaMs) ?? 0) + kwh);
    }
  }

  // Linha de rede (posteId nulo) dos dias sintéticos.
  for (const [diaMs, kwh] of kwhSinteticoRede) {
    agregados.push(linhaAgregado(null, diaMs, kwh));
  }

  // Agregado (por poste + rede) dos dias cobertos por telemetria bruta.
  for (const [diaMs, porPoste] of kwhRawPorDia) {
    if (diaMs >= hojeUtc) continue; // dia corrente fica a cargo do app
    let redeKwh = 0;
    for (const [posteId, kwh] of porPoste) {
      redeKwh += kwh;
      agregados.push(linhaAgregado(posteId, diaMs, kwh));
    }
    agregados.push(linhaAgregado(null, diaMs, redeKwh));
  }

  await inserirEmLotes(leituras, (lote) =>
    prisma.leituraTelemetria.createMany({ data: lote }),
  );
  await inserirEmLotes(eventos, (lote) =>
    prisma.eventoSensor.createMany({ data: lote }),
  );
  await inserirEmLotes(agregados, (lote) =>
    prisma.agregadoConsumo.createMany({ data: lote }),
  );

  console.log(
    `Backfill concluído: ${leituras.length} leituras, ${eventos.length} eventos, ${agregados.length} agregados.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
