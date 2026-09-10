import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PERIODOS_KPI } from '../../common/periodo';
import type { PeriodoKpi } from '../../common/periodo';

export class RankingQuery {
  @IsOptional()
  @IsIn(PERIODOS_KPI)
  periodo: PeriodoKpi = 'mes';

  /// Quantos postes no ranking (PRD 5.3 · top 5).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limite: number = 5;
}
