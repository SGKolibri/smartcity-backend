import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PERIODOS_KPI } from '../../common/periodo';
import type { PeriodoKpi } from '../../common/periodo';

export class KpisQuery {
  /// Período do dashboard. Default: mês.
  @ApiPropertyOptional({
    enum: PERIODOS_KPI,
    default: 'mes',
    description: 'Janela do dashboard.',
  })
  @IsOptional()
  @IsIn(PERIODOS_KPI)
  periodo: PeriodoKpi = 'mes';
}
