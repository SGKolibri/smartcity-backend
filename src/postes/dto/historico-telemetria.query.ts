import { IsIn, IsOptional } from 'class-validator';
import { PERIODOS_TELEMETRIA } from '../../common/periodo';
import type { PeriodoTelemetria } from '../../common/periodo';

export class HistoricoTelemetriaQuery {
  /// Período do histórico. Default: hoje.
  @IsOptional()
  @IsIn(PERIODOS_TELEMETRIA)
  periodo: PeriodoTelemetria = 'hoje';
}
