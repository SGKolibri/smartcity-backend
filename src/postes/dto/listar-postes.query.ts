import { StatusPoste } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListarPostesQuery {
  /// Filtro por status (PRD 5.1 · Todos/Normal/Atenção/Falha/Manutenção).
  @ApiPropertyOptional({
    enum: StatusPoste,
    description: 'Filtra por status. Omitir = todos.',
  })
  @IsOptional()
  @IsEnum(StatusPoste)
  status?: StatusPoste;

  /// Busca livre por rua ou bairro.
  @ApiPropertyOptional({
    description: 'Busca por rua ou bairro (sem distinção de acento/caixa).',
    example: 'centro',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  busca?: string;
}
