# Roadmap — Backend (NestJS)

Iluminação Pública Inteligente · Prefeitura de Itaguari, GO

Trilha independente, desenvolvida primeiro. Entrega a API completa com dados mockados antes de iniciar o app mobile. Baseado no PRD do sistema.

## Fase 1 · Setup e modelagem de dados

- [ ] Setup do projeto NestJS (módulos, estrutura de pastas por domínio).
- [ ] Banco de dados (PostgreSQL) via Docker.
- [ ] Schema (Prisma ou TypeORM) das entidades do PRD: `Poste`, `LeituraTelemetria`, `EventoSensor`, `AgregadoConsumo`.
- [ ] Seed da rede de 248 postes de Itaguari, GO, com endereços e coordenadas plausíveis.
- [ ] Seed inicial de status compatível com o PRD (231 normal, 9 consumo alto, 5 falha/offline, 3 manutenção).

## Fase 2 · Simulador de telemetria IoT

- [ ] Job/worker que simula a variação de luminosidade por poste (piso 50%, pico 100% na detecção de veículo, retorno ao piso).
- [ ] Geração de eventos de sensor mockados (veículo detectado / retorno ao piso, com sentido e horário).
- [ ] Geração de leituras de consumo (kW) coerentes com o estado de luminosidade de cada poste.
- [ ] Simulação de transição de status (postes entrando em atenção, falha ou voltando a normal ao longo do tempo).

## Fase 3 · API REST · Postes

- [ ] `GET /postes` — lista com filtro por status e busca por rua/bairro.
- [ ] `GET /postes/:id` — detalhe do poste (status, consumo instantâneo, luminosidade atual).
- [ ] `GET /postes/:id/telemetria?periodo=hoje|semana|mes` — histórico de consumo.
- [ ] `GET /postes/:id/eventos` — log de eventos do sensor 360°.
- [ ] `PATCH /postes/:id/status` — atribuição manual de manutenção (suporte à ação "Agendar manutenção").

## Fase 4 · API REST · KPIs

- [ ] `GET /kpis?periodo=dia|semana|mes|ano` — consumo total, custo total e variação frente ao período anterior.
- [ ] `GET /kpis/maior-consumo?periodo=...` — ranking dos postes de maior consumo.
- [ ] `GET /kpis/postes-por-status` — contagem de postes por status.
- [ ] Cálculo de custo com tarifa B4a (R$ 0,58/kWh) aplicado sobre o consumo agregado.

## Fase 5 · Tempo real

- [ ] Gateway WebSocket para consumo e luminosidade ao vivo por poste.
- [ ] Canal agregado para atualização ao vivo do mapa (múltiplos postes simultâneos).

## Fase 6 · Documentação e fechamento da trilha

- [ ] Documentação da API (Swagger/OpenAPI).
- [ ] README com instruções de setup, seed e execução do simulador.
- [ ] Coleção de exemplos de payload para cada endpoint, servindo de contrato para o time mobile.

## Marco de conclusão

A trilha de backend é considerada completa quando todos os endpoints acima respondem com dados mockados coerentes com o PRD, o simulador de telemetria roda de forma contínua e a documentação da API está pronta para servir de contrato ao desenvolvimento do app Flutter. Esse marco libera o início da trilha mobile.
