import { intlLocale } from '@/lib/intl-locale';
import type { Locale } from '@/i18n/routing';

type GastoParaResumen = { monto: number; pagado_por: string; fecha: string };

export type ResumenMes = {
  clave: string; // 'YYYY-MM', para ordenar
  etiqueta: string; // 'Agosto 2026' / 'August 2026', para mostrar
  total: number;
  porPersona: Map<string, number>;
};

// Agrupa gastos por mes calendario (según `fecha`, no `created_at`) —
// solo gastos, no pagos: un pago no es "lo que se gastó ese mes", es
// liquidar una deuda de gastos ya contados.
export function agruparPorMes(gastos: GastoParaResumen[], locale: Locale): ResumenMes[] {
  const meses = new Map<string, ResumenMes>();

  for (const gasto of gastos) {
    const clave = gasto.fecha.slice(0, 7);

    if (!meses.has(clave)) {
      const [anio, mes] = clave.split('-').map(Number);
      const etiquetaCruda = new Intl.DateTimeFormat(intlLocale(locale), { month: 'long', year: 'numeric' }).format(
        new Date(anio, mes - 1, 1)
      );
      meses.set(clave, {
        clave,
        etiqueta: etiquetaCruda.charAt(0).toUpperCase() + etiquetaCruda.slice(1),
        total: 0,
        porPersona: new Map(),
      });
    }

    const resumen = meses.get(clave)!;
    resumen.total += gasto.monto;
    resumen.porPersona.set(gasto.pagado_por, (resumen.porPersona.get(gasto.pagado_por) ?? 0) + gasto.monto);
  }

  return [...meses.values()].sort((a, b) => b.clave.localeCompare(a.clave));
}
