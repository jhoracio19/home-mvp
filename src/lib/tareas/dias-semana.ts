type Traductor = (key: string) => string;

// Valor = Date.prototype.getDay() (0 = domingo ... 6 = sábado), para que
// el cálculo de "próximo día que aplica" sea directo. Se muestran en
// orden lunes-a-domingo porque así se piensa la semana en la UI.
const CLAVES_ORDEN_LUNES_A_PRIMERO = [
  { valor: 1, clave: 'lunes' },
  { valor: 2, clave: 'martes' },
  { valor: 3, clave: 'miercoles' },
  { valor: 4, clave: 'jueves' },
  { valor: 5, clave: 'viernes' },
  { valor: 6, clave: 'sabado' },
  { valor: 0, clave: 'domingo' },
] as const;

export function diasSemana(t: Traductor) {
  return CLAVES_ORDEN_LUNES_A_PRIMERO.map(({ valor, clave }) => ({
    valor,
    corta: t(`${clave}Corta`),
    nombre: t(clave),
  }));
}

export function etiquetaDiasSemana(dias: number[], t: Traductor): string {
  return CLAVES_ORDEN_LUNES_A_PRIMERO.filter(({ valor }) => dias.includes(valor))
    .map(({ clave }) => t(`${clave}Abrev`))
    .join(', ');
}
