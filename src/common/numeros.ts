/** Arredonda para um número fixo de casas decimais. */
export const arredondar = (valor: number, casas: number): number => {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
};
