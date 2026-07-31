export type Urgencia = 'vencido' | 'hoy' | 'pronto' | 'normal';

// Parseo manual (no `new Date(fecha)`) para evitar que el motor interprete
// la fecha 'YYYY-MM-DD' como UTC y la corra un día al convertir a local.
export function parseFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function calcularDiasRestantes(fecha: Date): number {
  const hoy = new Date();
  const hoyMedianoche = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const msPorDia = 24 * 60 * 60 * 1000;
  return Math.round((fecha.getTime() - hoyMedianoche.getTime()) / msPorDia);
}

export function clasificarUrgencia(diasRestantes: number): Urgencia {
  if (diasRestantes < 0) return 'vencido';
  if (diasRestantes === 0) return 'hoy';
  if (diasRestantes <= 3) return 'pronto';
  return 'normal';
}

export function etiquetaUrgencia(diasRestantes: number): string {
  if (diasRestantes < 0) {
    const dias = Math.abs(diasRestantes);
    return `Venció hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
  if (diasRestantes === 0) return 'Vence hoy';
  if (diasRestantes === 1) return 'Vence mañana';
  return `Vence en ${diasRestantes} días`;
}
