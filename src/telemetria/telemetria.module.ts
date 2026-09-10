import { Module } from '@nestjs/common';
import { TelemetriaService } from './telemetria.service';

/**
 * Domínio: Telemetria.
 * Expõe o histórico de consumo consumido por GET /postes/:id/telemetria
 * (roteado no PostesController).
 */
@Module({
  providers: [TelemetriaService],
  exports: [TelemetriaService],
})
export class TelemetriaModule {}
