import { StatusPoste } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListarPostesQuery {
  /// Filtro por status (PRD 5.1 · Todos/Normal/Atenção/Falha/Manutenção).
  @IsOptional()
  @IsEnum(StatusPoste)
  status?: StatusPoste;

  /// Busca livre por rua ou bairro.
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  busca?: string;
}
