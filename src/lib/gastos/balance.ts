type Gasto = { monto: number; pagado_por: string };

// Positivo = le deben (pagó de más); negativo = debe (pagó de menos).
// Cada gasto se reparte entre `numMiembros` a partes iguales — ver
// nota en schema.sql sobre por qué no se guarda quién participó en
// cada gasto en su momento.
export function calcularBalances(gastos: Gasto[], usuarioIds: string[]): Map<string, number> {
  const balances = new Map(usuarioIds.map((id) => [id, 0]));
  const numMiembros = usuarioIds.length || 1;

  for (const gasto of gastos) {
    const partePorPersona = gasto.monto / numMiembros;

    for (const id of usuarioIds) {
      const actual = balances.get(id) ?? 0;
      balances.set(id, actual - partePorPersona);
    }

    const pagador = balances.get(gasto.pagado_por);
    if (pagador !== undefined) {
      balances.set(gasto.pagado_por, pagador + gasto.monto);
    }
  }

  return balances;
}
