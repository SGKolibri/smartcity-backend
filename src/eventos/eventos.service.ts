import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Log do sensor 360° de um poste, mais recentes primeiro (PRD 5.2). */
  listarPorPoste(posteId: string, limite: number) {
    return this.prisma.eventoSensor.findMany({
      where: { posteId },
      orderBy: { timestamp: 'desc' },
      take: limite,
      select: {
        id: true,
        tipo: true,
        sentido: true,
        luminosidadeResultante: true,
        timestamp: true,
      },
    });
  }
}
