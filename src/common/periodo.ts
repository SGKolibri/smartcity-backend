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

  const dias = periodo === 'semana' ? 7 : 30;
  const inicio = new Date(agora);
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);
  return { inicio, fim: agora, granularidade: 'day', horasPorBucket: 24 };
}
