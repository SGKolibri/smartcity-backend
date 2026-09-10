import { IsIn, IsOptional } from 'class-validator';
import { PERIODOS_KPI } from '../../common/periodo';
import type { PeriodoKpi } from '../../common/periodo';

export class KpisQuery {
  /// Período do dashboard. Default: mês.
  @IsOptional()
  @IsIn(PERIODOS_KPI)
  periodo: PeriodoKpi = 'mes';
}
