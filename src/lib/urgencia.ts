export type Urgencia = 'vencido' | 'hoy' | 'pronto' | 'normal';

// MVP de una sola zona horaria: el servidor corre en UTC (Vercel), así
// que "hoy" ahí puede ya ser mañana para alguien en México cerca de
// medianoche. Mientras no haya perfil de zona horaria por usuario,
// fijamos esta — fácil de volver configurable después.
const ZONA_HORARIA = 'America/Mexico_City';

// Parseo manual (no `new Date(fecha)`) para evitar que el motor interprete
// la fecha 'YYYY-MM-DD' como UTC y la corra un día al convertir a local.
export function parseFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

function hoyEnZonaHoraria(): Date {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return new Date(Number(valor('year')), Number(valor('month')) - 1, Number(valor('day')));
}

export function calcularDiasRestantes(fecha: Date): number {
  const msPorDia = 24 * 60 * 60 * 1000;
  return Math.round((fecha.getTime() - hoyEnZonaHoraria().getTime()) / msPorDia);
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
