import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EventosService } from '../eventos/eventos.service';
import { TelemetriaService } from '../telemetria/telemetria.service';
import { AtualizarStatusDto } from './dto/atualizar-status.dto';
import { HistoricoTelemetriaQuery } from './dto/historico-telemetria.query';
import { ListarEventosQuery } from './dto/listar-eventos.query';
import { ListarPostesQuery } from './dto/listar-postes.query';
import { PostesService } from './postes.service';

@Controller('postes')
export class PostesController {
  constructor(
    private readonly postes: PostesService,
    private readonly telemetria: TelemetriaService,
    private readonly eventos: EventosService,
  ) {}

  /** GET /postes — lista para o mapa, com filtro por status e busca. */
  @Get()
  listar(@Query() query: ListarPostesQuery) {
    return this.postes.listar(query);
  }

  /** GET /postes/:id — detalhe do poste. */
  @Get(':id')
  detalhe(@Param('id', ParseUUIDPipe) id: string) {
    return this.postes.buscarPorId(id);
  }

  /** GET /postes/:id/telemetria?periodo=hoje|semana|mes — histórico de consumo. */
  @Get(':id/telemetria')
  async historicoTelemetria(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: HistoricoTelemetriaQuery,
  ) {
    await this.postes.garantirExiste(id);
    return this.telemetria.historicoPorPoste(id, query.periodo);
  }

  /** GET /postes/:id/eventos — log do sensor 360°. */
  @Get(':id/eventos')
  async logEventos(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListarEventosQuery,
  ) {
    await this.postes.garantirExiste(id);
    return this.eventos.listarPorPoste(id, query.limite);
  }

  /** PATCH /postes/:id/status — atribuição manual de manutenção. */
  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarStatusDto,
  ) {
    return this.postes.atualizarStatus(id, dto.status);
  }
}
