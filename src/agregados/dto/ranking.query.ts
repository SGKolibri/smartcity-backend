import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PERIODOS_KPI } from '../../common/periodo';
import type { PeriodoKpi } from '../../common/periodo';

export class RankingQuery {
  @ApiPropertyOptional({ enum: PERIODOS_KPI, default: 'mes' })
  @IsOptional()
  @IsIn(PERIODOS_KPI)
  periodo: PeriodoKpi = 'mes';

  /// Quantos postes no ranking (PRD 5.3 · top 5).
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 20,
    default: 5,
    description: 'Tamanho do ranking.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limite: number = 5;
}
