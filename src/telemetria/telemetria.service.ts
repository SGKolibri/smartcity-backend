import { Injectable } from '@nestjs/common';
import { TARIFA_B4A_KWH } from '../common/constants';
import { arredondar } from '../common/numeros';
import { janelaTelemetria, PeriodoTelemetria } from '../common/periodo';
import { PrismaService } from '../prisma/prisma.service';

interface BucketRaw {
  bucket: Date;
  media_kw: number;
  pico_kw: number;
  soma_kw: number;
  soma_ref_kw: number;
  n: number;
}

@Injectable()
export class TelemetriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Histórico de consumo de um poste no período, agregado para o gráfico de
   * barras do detalhe (PRD 5.2), com os indicadores Média, Pico e Economia.
   *
   * Economia = quanto se gastou a menos frente a operar sempre em 100% pelas
   * mesmas horas em que a luz esteve ligada.
   */
  async historicoPorPoste(posteId: string, periodo: PeriodoTelemetria) {
    const { inicio, fim, granularidade, horasPorBucket } =
      janelaTelemetria(periodo);

    const linhas = await this.prisma.$queryRaw<BucketRaw[]>`
      SELECT
        date_trunc(${granularidade}::text, "timestamp") AS bucket,
        avg("consumoKw")::float8 AS media_kw,
        max("consumoKw")::float8 AS pico_kw,
        sum("consumoKw")::float8 AS soma_kw,
        sum(
          CASE WHEN "luminosidadePct" > 0
            THEN "consumoKw" * 100.0 / "luminosidadePct"
            ELSE 0 END
        )::float8 AS soma_ref_kw,
        count(*)::int AS n
      FROM leituras_telemetria
      WHERE "posteId" = ${posteId}
        AND "timestamp" >= ${inicio}
        AND "timestamp" <= ${fim}
      GROUP BY 1
      ORDER BY 1
    `;

    const serie = linhas.map((l) => ({
      inicio: l.bucket,
      consumoKwh: arredondar(l.media_kw * horasPorBucket, 3),
      mediaKw: arredondar(l.media_kw, 4),
      picoKw: arredondar(l.pico_kw, 4),
    }));

    const totalLeituras = linhas.reduce((s, l) => s + l.n, 0);
    const consumoTotalKwh = arredondar(
      serie.reduce((s, b) => s + b.consumoKwh, 0),
      3,
    );
    const mediaKw = totalLeituras
      ? arredondar(
          linhas.reduce((s, l) => s + l.media_kw * l.n, 0) / totalLeituras,
          4,
        )
      : 0;
    const picoKw = arredondar(
      linhas.reduce((max, l) => Math.max(max, l.pico_kw), 0),
      4,
    );
    const somaKw = linhas.reduce((s, l) => s + l.soma_kw, 0);
    const somaRefKw = linhas.reduce((s, l) => s + l.soma_ref_kw, 0);
    const economiaPct =
      somaRefKw > 0 ? arredondar((1 - somaKw / somaRefKw) * 100, 1) : 0;

    return {
      posteId,
      periodo,
      inicio,
      fim,
      resumo: {
        consumoTotalKwh,
        custoTotalReais: arredondar(consumoTotalKwh * TARIFA_B4A_KWH, 2),
        mediaKw,
        picoKw,
        economiaPct,
      },
      serie,
    };
  }
}
