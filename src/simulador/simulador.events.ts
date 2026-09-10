import { StatusPoste } from '@prisma/client';

/// Emitido a cada tick do simulador com os postes que mudaram (luminosidade,
/// consumo ou status). O gateway de tempo real escuta e repassa aos clientes.
export const EVENTO_SIM_POSTES_ATUALIZADOS = 'simulador.postes.atualizados';

/// Recorte "ao vivo" de um poste (mapa + tela de detalhe).
export interface SnapshotPoste {
  posteId: string;
  codigo: string;
  status: StatusPoste;
  luminosidadeAtual: number;
  consumoInstantaneoKw: number;
  ultimaLeituraEm: Date | null;
}

export interface PostesAtualizadosEvent {
  /// O que disparou o lote (para o cliente priorizar a renderização).
  origem: 'sensores' | 'telemetria' | 'status';
  postes: SnapshotPoste[];
  em: Date;
}
