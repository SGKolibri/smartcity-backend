import { Module } from '@nestjs/common';
import { TempoRealGateway } from './tempo-real.gateway';

/**
 * Domínio: Tempo real (roadmap Fase 5).
 * Gateway WebSocket alimentado pelos eventos do simulador (via EventEmitter).
 */
@Module({
  providers: [TempoRealGateway],
})
export class TempoRealModule {}
