import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PostesModule } from './postes/postes.module';
import { TelemetriaModule } from './telemetria/telemetria.module';
import { EventosModule } from './eventos/eventos.module';
import { AgregadosModule } from './agregados/agregados.module';
import { SimuladorModule } from './simulador/simulador.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PostesModule,
    TelemetriaModule,
    EventosModule,
    AgregadosModule,
    SimuladorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
