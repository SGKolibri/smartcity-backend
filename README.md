# Iluminação Pública Inteligente — Backend

API NestJS do mock de iluminação pública inteligente da Prefeitura de Itaguari, GO.
Trilha de backend desenvolvida primeiro; entrega a API completa com dados mockados
antes do início do app mobile (Flutter).

Ver [`PRD-iluminacao-publica-inteligente.md`](./PRD-iluminacao-publica-inteligente.md)
e [`roadmap-backend-nestjs.md`](./roadmap-backend-nestjs.md).

## Stack

- **NestJS 12** (Node + TypeScript), gerenciado com **Bun**
- **PostgreSQL 16** via Docker
- **Prisma 6** como ORM / camada de acesso a dados

## Pré-requisitos

- [Bun](https://bun.sh) ≥ 1.3
- Docker + Docker Compose

## Setup

```bash
# 1. Dependências
bun install

# 2. Variáveis de ambiente
cp .env.example .env

# 3. Banco de dados (PostgreSQL em container)
bun run db:up

# 4. Cliente Prisma + migrations
bun run prisma:generate
bun run prisma:migrate

# 5. Seed da rede de 248 postes de Itaguari
bun run db:seed
```

## Executar

```bash
bun run start:dev      # http://localhost:3000 (watch mode)
```

## Scripts úteis

| Script | Ação |
|---|---|
| `bun run db:up` / `db:down` | Sobe / derruba o PostgreSQL (Docker) |
| `bun run prisma:migrate` | Cria e aplica migrations em desenvolvimento |
| `bun run prisma:studio` | Prisma Studio (inspeção visual do banco) |
| `bun run db:seed` | Popula a rede de postes (idempotente) |
| `bun run db:reset` | Recria o banco do zero e roda o seed |
| `bun run build` | Compila para `dist/` |
| `bun run lint` | oxlint |

## Modelo de dados

Entidades em `prisma/schema.prisma` (PRD seção 7):

- **Poste** — código, endereço, bairro, coordenadas, status, luminosidade e consumo atuais.
- **LeituraTelemetria** — série temporal de consumo (kW) e luminosidade (%) por poste.
- **EventoSensor** — log do sensor 360° (veículo detectado / retorno ao piso, sentido).
- **AgregadoConsumo** — consumo e custo agregados por período (`posteId` nulo = rede inteira).

Enums: `StatusPoste`, `TipoEventoSensor`, `SentidoVeiculo`, `PeriodoAgregado`.

## Seed

`prisma/seed.ts` gera de forma **determinística** (PRNG com seed fixa) os 248 postes
distribuídos por 9 bairros de Itaguari, com endereços e coordenadas plausíveis em torno
do centro da cidade. A distribuição inicial de status segue o PRD:

| Status | Qtd |
|---|---|
| Normal | 231 |
| Consumo alto | 9 |
| Falha / Offline | 5 |
| Manutenção | 3 |

O seed limpa e recria a rede a cada execução.

## Roadmap

- [x] **Fase 1** — Setup e modelagem de dados
- [ ] **Fase 2** — Simulador de telemetria IoT
- [ ] **Fase 3** — API REST · Postes
- [ ] **Fase 4** — API REST · KPIs
- [ ] **Fase 5** — Tempo real (WebSocket)
- [ ] **Fase 6** — Documentação e fechamento da trilha
