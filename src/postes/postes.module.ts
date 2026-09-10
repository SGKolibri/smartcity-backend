import { Module } from '@nestjs/common';
import { EventosModule } from '../eventos/eventos.module';
import { TelemetriaModule } from '../telemetria/telemetria.module';
import { PostesController } from './postes.controller';
import { PostesService } from './postes.service';

/**
 * Domínio: Postes (roadmap Fase 3).
 * Concentra também as rotas aninhadas /postes/:id/telemetria e /postes/:id/eventos,
 * delegando a lógica aos respectivos domínios.
 */
@Module({
  imports: [TelemetriaModule, EventosModule],
  controllers: [PostesController],
  providers: [PostesService],
})
export class PostesModule {}
