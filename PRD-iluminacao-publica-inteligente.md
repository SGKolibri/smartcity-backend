# PRD — Iluminação Pública Inteligente

Prefeitura de Itaguari (GO) · Mock acadêmico de IoT e Smart Cities

| | |
|---|---|
| Tipo de entrega | Atividade acadêmica, IoT / Smart Cities |
| Cidade de exemplo | Itaguari, GO (fictícia para fins do mock) |
| Plataforma | App mobile (Flutter) + backend (NestJS) |
| Mapa | OpenStreetMap via `flutter_map` |
| Design system | Cores herdadas do BRUT, tipografia IBM Plex Sans / IBM Plex Mono, radius 0, sem sombra |
| Status | Design das 3 telas principais aprovado |

## 1. Contexto e problema

Iluminação pública tradicional opera em intensidade fixa durante toda a noite, independente de haver movimento na rua. Isso gera consumo energético acima do necessário em ruas de baixo fluxo durante boa parte da madrugada.

O sistema propõe controle dinâmico de luminosidade por poste, baseado em detecção de veículos via sensor de câmera 360°. Cada poste opera em um piso de 50% de luminosidade e sobe para 100% quando detecta um veículo se aproximando, retornando ao piso quando o veículo se afasta.

## 2. Objetivos

- Demonstrar, em formato de mock funcional, um sistema de gestão energética de iluminação pública orientado a IoT.
- Dar à prefeitura visibilidade de consumo e custo por poste e por rede, em tempo real e historicamente.
- Evidenciar economia de energia gerada pelo controle dinâmico de luminosidade frente a uma operação em 100% fixo.
- Servir como primeira entrega de uma atividade acadêmica de IoT / Smart Cities, com mock navegável e visualmente coerente.

## 3. Escopo desta entrega

Incluído:
- Rede simulada de 248 postes na cidade de Itaguari, GO.
- 3 telas mobile: mapa da cidade, detalhe do poste, dashboard de KPIs.
- Dados de telemetria, histórico de consumo e eventos de sensor mockados, mas plausíveis.
- Cálculo de custo com base em tarifa de referência (B4a iluminação pública, R$ 0,58/kWh).

Fora de escopo nesta entrega:
- Hardware real (sensores, câmeras, controladores de luminosidade).
- Autenticação e perfis de usuário.
- Notificações push.
- Hospedagem de tiles OSM em produção ou integração real com a concessionária de energia.
- Cadastro/edição de postes pelo app (rede é fixa para o mock).

## 4. Personas

**Gestor municipal** (usuário primário): acompanha consumo e custo da rede de iluminação, usa principalmente o mapa e o dashboard de KPIs para decisões de orçamento e manutenção preventiva.

**Técnico de manutenção** (usuário secundário): consulta o detalhe de postes com falha, agenda manutenção e confirma leitura de eventos do sensor.

## 5. Especificação funcional

### 5.1 Mapa da cidade

- Contador de postes no header ("248 postes").
- Busca por rua ou bairro.
- Filtro por status: Todos, Normal, Atenção, Falha, Manutenção.
- Marcadores no mapa coloridos por status (verde = normal, laranja = consumo alto/atenção, vermelho = falha/offline, cinza = manutenção).
- Camada de heatmap sobre o mapa, representando a luminosidade atual de cada área (legenda de 50% a 100%).
- Toque em um poste abre um bottom sheet com código, endereço, status, consumo instantâneo e luminosidade atual, com CTA "Ver detalhe do poste".

### 5.2 Detalhe do poste

- Cabeçalho com código do poste (ex.: P-042), endereço, coordenadas e cidade.
- Badge de status (Normal / Consumo alto / Falha-Offline / Manutenção).
- Consumo em tempo real, com indicador "AO VIVO" e valor em kW.
- Barra de luminosidade com marcação do piso (50%) e valor atual.
- Texto contextual dinâmico conforme o estado: evento de veículo detectado quando ativo, ou aviso de telemetria ausente com timestamp da última leitura válida e abertura automática de chamado quando offline.
- Histórico de consumo com seletor de período (Hoje / Semana / Mês), gráfico de barras e indicadores de Média, Pico e Economia (%).
- Log de eventos do sensor 360°: tipo de evento (veículo detectado / retorno ao piso), sentido, horário e luminosidade resultante.
- Ações: "Agendar manutenção" e "Ver no mapa", priorizadas quando o poste está em falha.

### 5.3 Dashboard de KPIs

- Seletor de período: Dia, Semana, Mês, Ano.
- Indicadores agregados de consumo total (kWh) e custo total (R$) no período, com variação percentual frente ao período anterior equivalente.
- Referência de tarifa vigente exibida (B4a iluminação pública).
- Gráfico comparativo de consumo no período atual frente ao anterior.
- Ranking dos 5 postes de maior consumo no período, com endereço e valor em kWh.
- Distribuição de postes por status, em barra empilhada com contagem absoluta por categoria.

## 6. Regras de negócio

- Luminosidade opera em dois níveis: piso de 50% e pico de 100%. A transição ocorre por detecção/perda de veículo pelo sensor 360°.
- Status do poste é derivado da telemetria:
  - **Normal**: consumo dentro da média esperada do trecho.
  - **Consumo alto / Atenção**: consumo acima da média do trecho nas últimas 24h.
  - **Falha / Offline**: ausência de telemetria por um intervalo definido, com abertura automática de chamado.
  - **Manutenção**: status atribuído manualmente pelo técnico.
- Custo = consumo (kWh) × tarifa vigente (mock: R$ 0,58/kWh, classe B4a).
- Toda variação percentual exibida é sempre relativa ao mesmo período anterior equivalente (ex.: ano atual vs. ano anterior).

## 7. Modelo de dados (alto nível)

- **Poste**: id, código, endereço, coordenadas, status atual, luminosidade atual, consumo instantâneo.
- **LeituraTelemetria**: poste_id, timestamp, consumo_kw, luminosidade_pct.
- **EventoSensor**: poste_id, timestamp, tipo (veículo_detectado / retorno_ao_piso), sentido, luminosidade_resultante.
- **AgregadoConsumo**: poste_id (nulo para agregado geral da rede), período, consumo_total_kwh, custo_total_reais.

## 8. Requisitos não funcionais

- Mobile-first, otimizado para a resolução de referência 412×892.
- Atualização de dados em tempo real ou near-real-time no mapa e na tela de detalhe.
- Backend preparado para ingestão de dados de dispositivos IoT, tipicamente via protocolo leve de mensageria (MQTT) para telemetria dos postes, com REST/WebSocket para o app consumir os dados agregados.
- Sem dependência de serviços de mapa pagos por assinatura.

## 9. Critérios de aceite deste mock

- As 3 telas navegáveis, com o detalhe do poste refletindo o poste selecionado no mapa.
- Todos os 4 estados de poste representados visualmente (cores, badges e conteúdo contextual).
- Dashboard reagindo à troca de período com dados coerentes entre si.
- Consistência de componentes (cards, badges, seletor de período) entre as três telas.
