type EntradaHistorial = { usuario_id: string; a_tiempo: boolean | null; completada_en: string };

export type Logros = { puntos: number; racha: number };

const ZONA_HORARIA = 'America/Mexico_City';

function claveDia(fechaISO: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(fechaISO));
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '00';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

// Solo cuenta desde que existe `a_tiempo` (ver nota en schema.sql) —
// entradas viejas con a_tiempo=null se ignoran, no se inventa su valor.
// "Racha" = días con al menos una tarea completada a tiempo, contando
// hacia atrás desde el más reciente, sin importar cuántos días pasaron
// entre uno y otro (no es una racha diaria tipo Duolingo — con pocas
// tareas por semana, exigir "todos los días" no tendría sentido).
// Un día solo cuenta una vez sin importar cuántas tareas se marquen ese
// día, para que completar varias de una sentada no infle la racha.
export function calcularLogros(historial: EntradaHistorial[], usuarioId: string): Logros {
  const propios = historial.filter((h) => h.usuario_id === usuarioId && h.a_tiempo !== null);

  const puntos = propios.filter((h) => h.a_tiempo).length;

  const diaATiempo = new Map<string, boolean>();
  for (const h of propios) {
    const clave = claveDia(h.completada_en);
    diaATiempo.set(clave, (diaATiempo.get(clave) ?? false) || Boolean(h.a_tiempo));
  }

  const dias = [...diaATiempo.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  let racha = 0;
  for (const [, aTiempo] of dias) {
    if (aTiempo) racha++;
    else break;
  }

  return { puntos, racha };
}
