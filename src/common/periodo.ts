/// Períodos do histórico de consumo por poste (PRD 5.2 · seletor Hoje/Semana/Mês).
export const PERIODOS_TELEMETRIA = ['hoje', 'semana', 'mes'] as const;
export type PeriodoTelemetria = (typeof PERIODOS_TELEMETRIA)[number];

export interface JanelaTelemetria {
  inicio: Date;
  fim: Date;
  /// Unidade de agregação do gráfico de barras.
  granularidade: 'hour' | 'day';
  /// Horas cobertas por cada barra (para converter média kW → kWh).
  horasPorBucket: number;
}

/** Traduz o período em uma janela de tempo e a granularidade do gráfico. */
export function janelaTelemetria(
  periodo: PeriodoTelemetria,
  agora: Date = new Date(),
): JanelaTelemetria {
  if (periodo === 'hoje') {
    const inicio = new Date(agora);
    inicio.setHours(0, 0, 0, 0);
    return { inicio, fim: agora, granularidade: 'hour', horasPorBucket: 1 };
  }

  // Alinha à meia-noite UTC para casar exatamente com os buckets `date_trunc`.
  const dias = periodo === 'semana' ? 7 : 30;
  const inicio = new Date(agora);
  inicio.setUTCDate(inicio.getUTCDate() - dias);
  inicio.setUTCHours(0, 0, 0, 0);
  return { inicio, fim: agora, granularidade: 'day', horasPorBucket: 24 };
}

// --- KPIs / Dashboard (PRD 5.3 · seletor Dia/Semana/Mês/Ano) --------------

export const PERIODOS_KPI = ['dia', 'semana', 'mes', 'ano'] as const;
export type PeriodoKpi = (typeof PERIODOS_KPI)[number];

/// Quantidade de dias que cada período cobre.
export const DIAS_POR_PERIODO: Record<PeriodoKpi, number> = {
  dia: 1,
  semana: 7,
  mes: 30,
  ano: 365,
};

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export interface JanelaKpi {
  atual: Intervalo;
  /// Mesmo período imediatamente anterior (PRD seção 6 · variação equivalente).
  anterior: Intervalo;
  /// Unidade das barras do gráfico comparativo.
  granularidade: 'hora' | 'dia' | 'mes';
}

/**
 * Janela atual + janela anterior equivalente para os KPIs do dashboard.
 *
 * Ambas são blocos de `N` dias inteiros terminando na meia-noite (UTC) de hoje,
 * para casar com os dias consolidados em `AgregadoConsumo` e comparar período
 * cheio com período cheio (PRD seção 6). O dia corrente parcial é reportado à
 * parte (`parcialHoje`), fora da comparação.
 */
export function janelaKpi(
  periodo: PeriodoKpi,
  agora: Date = new Date(),
): JanelaKpi {
  const ms = DIAS_POR_PERIODO[periodo] * 24 * 60 * 60_000;
  const fim = inicioDoDiaUtc(agora);
  const inicio = new Date(fim.getTime() - ms);
  const granularidade =
    periodo === 'dia' ? 'hora' : periodo === 'ano' ? 'mes' : 'dia';
  return {
    atual: { inicio, fim },
    anterior: { inicio: new Date(inicio.getTime() - ms), fim: inicio },
    granularidade,
  };
}

/// Meia-noite (UTC) de hoje — fronteira entre dias já consolidados em
/// AgregadoConsumo e o consumo parcial do dia corrente (lido da telemetria).
export function inicioDoDiaUtc(agora: Date = new Date()): Date {
  const d = new Date(agora);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
