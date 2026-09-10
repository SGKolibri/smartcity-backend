import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  info() {
    return {
      nome: 'Iluminação Pública Inteligente — API',
      cidade: 'Itaguari, GO',
      docs: '/docs',
      openapi: '/docs-json',
      tempoReal: '/tempo-real (Socket.IO)',
    };
  }
}
