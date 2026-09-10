import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PERIODOS_TELEMETRIA } from '../../common/periodo';
import type { PeriodoTelemetria } from '../../common/periodo';

export class HistoricoTelemetriaQuery {
  /// Período do histórico. Default: hoje.
  @ApiPropertyOptional({
    enum: PERIODOS_TELEMETRIA,
    default: 'hoje',
    description: 'Janela do histórico de consumo.',
  })
  @IsOptional()
  @IsIn(PERIODOS_TELEMETRIA)
  periodo: PeriodoTelemetria = 'hoje';
}
