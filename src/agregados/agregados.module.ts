import { Module } from '@nestjs/common';
import { AgregadosService } from './agregados.service';
import { KpisController } from './kpis.controller';

/**
 * Domínio: Agregados de consumo e KPIs (roadmap Fase 4).
 * Expõe GET /kpis, /kpis/maior-consumo e /kpis/postes-por-status, e consolida
 * a telemetria em AgregadoConsumo (rollup diário).
 */
@Module({
  controllers: [KpisController],
  providers: [AgregadosService],
  exports: [AgregadosService],
})
export class AgregadosModule {}
