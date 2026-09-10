import { StatusPoste } from '@prisma/client';

/// Emitido quando o status de um poste é alterado manualmente pela API
/// (PATCH /postes/:id/status). O simulador escuta para manter o estado em
/// memória em sincronia com o banco.
export const EVENTO_POSTE_STATUS_ALTERADO = 'poste.status.alterado';

export interface PosteStatusAlteradoEvent {
  posteId: string;
  status: StatusPoste;
}
