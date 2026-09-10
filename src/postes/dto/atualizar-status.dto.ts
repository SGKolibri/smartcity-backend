import { StatusPoste } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

/// Status atribuíveis manualmente pelo técnico (PRD 5.2 · "Agendar manutenção").
/// Os demais (`CONSUMO_ALTO`, `FALHA_OFFLINE`) são derivados da telemetria.
export const STATUS_MANUAIS = [
  StatusPoste.MANUTENCAO,
  StatusPoste.NORMAL,
] as const;
export type StatusManual = (typeof STATUS_MANUAIS)[number];

export class AtualizarStatusDto {
  @ApiProperty({
    enum: STATUS_MANUAIS,
    description:
      'Novo status. Só `MANUTENCAO` ou `NORMAL` — os demais são derivados da telemetria.',
  })
  @IsIn(STATUS_MANUAIS)
  status!: StatusManual;
}
