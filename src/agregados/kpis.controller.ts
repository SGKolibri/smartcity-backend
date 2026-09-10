import { Controller, Get, Query } from '@nestjs/common';
import { AgregadosService } from './agregados.service';
import { KpisQuery } from './dto/kpis.query';
import { RankingQuery } from './dto/ranking.query';

@Controller('kpis')
export class KpisController {
  constructor(private readonly agregados: AgregadosService) {}

  /** GET /kpis?periodo=dia|semana|mes|ano — consumo, custo e variação. */
  @Get()
  resumo(@Query() query: KpisQuery) {
    return this.agregados.resumo(query.periodo);
  }

  /** GET /kpis/maior-consumo?periodo=&limite= — ranking de maior consumo. */
  @Get('maior-consumo')
  maiorConsumo(@Query() query: RankingQuery) {
    return this.agregados.maiorConsumo(query.periodo, query.limite);
  }

  /** GET /kpis/postes-por-status — contagem de postes por status. */
  @Get('postes-por-status')
  postesPorStatus() {
    return this.agregados.postesPorStatus();
  }
}
