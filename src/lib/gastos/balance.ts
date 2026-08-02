type Gasto = { monto: number; pagado_por: string };
type Pago = { monto: number; de_usuario_id: string; a_usuario_id: string };

// Positivo = le deben (pagó de más, o le pagaron menos de lo que le
// tocaba recibir); negativo = debe. Cada gasto se reparte entre
// `numMiembros` a partes iguales — ver nota en schema.sql sobre por
// qué no se guarda quién participó en cada gasto en su momento.
//
// Los pagos (liquidar una deuda) mueven el balance directo entre dos
// personas: a quien paga se le "perdona" ese monto (balance sube), a
// quien recibe se le descuenta de lo que le debían (balance baja).
export function calcularBalances(gastos: Gasto[], pagos: Pago[], usuarioIds: string[]): Map<string, number> {
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

  for (const pago of pagos) {
    const de = balances.get(pago.de_usuario_id);
    if (de !== undefined) balances.set(pago.de_usuario_id, de + pago.monto);

    const a = balances.get(pago.a_usuario_id);
    if (a !== undefined) balances.set(pago.a_usuario_id, a - pago.monto);
  }

  return balances;
}
