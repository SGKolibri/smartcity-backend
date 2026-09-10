import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarEventosQuery {
  /// Quantidade máxima de eventos retornados (mais recentes primeiro).
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 200,
    default: 50,
    description: 'Máximo de eventos (mais recentes primeiro).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limite: number = 50;
}
