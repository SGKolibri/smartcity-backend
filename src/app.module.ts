import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PostesModule } from './postes/postes.module';
import { TelemetriaModule } from './telemetria/telemetria.module';
import { EventosModule } from './eventos/eventos.module';
import { AgregadosModule } from './agregados/agregados.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PostesModule,
    TelemetriaModule,
    EventosModule,
    AgregadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
