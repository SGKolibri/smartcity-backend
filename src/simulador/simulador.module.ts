import { Module } from '@nestjs/common';
import { SimuladorService } from './simulador.service';

/**
 * Domínio: Simulador de telemetria IoT (roadmap Fase 2).
 * Depende do ScheduleModule (registrado no AppModule) e do PrismaModule (global).
 */
@Module({
  providers: [SimuladorService],
})
export class SimuladorModule {}
