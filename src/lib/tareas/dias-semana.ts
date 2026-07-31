// Valor = Date.prototype.getDay() (0 = domingo ... 6 = sábado), para que
// el cálculo de "próximo día que aplica" sea directo. Se muestran en
// orden lunes-a-domingo porque así se piensa la semana en la UI.
export const DIAS_SEMANA = [
  { valor: 1, corta: 'L', nombre: 'Lunes' },
  { valor: 2, corta: 'M', nombre: 'Martes' },
  { valor: 3, corta: 'M', nombre: 'Miércoles' },
  { valor: 4, corta: 'J', nombre: 'Jueves' },
  { valor: 5, corta: 'V', nombre: 'Viernes' },
  { valor: 6, corta: 'S', nombre: 'Sábado' },
  { valor: 0, corta: 'D', nombre: 'Domingo' },
] as const;

const ABREVIATURAS: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};

export function etiquetaDiasSemana(dias: number[]): string {
  const ordenLunesAPrimero = [1, 2, 3, 4, 5, 6, 0];
  return ordenLunesAPrimero
    .filter((d) => dias.includes(d))
    .map((d) => ABREVIATURAS[d])
    .join(', ');
}
