import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';

/**
 * Domínio: Eventos do sensor 360°.
 * Expõe o log consumido por GET /postes/:id/eventos (roteado no PostesController).
 */
@Module({
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
