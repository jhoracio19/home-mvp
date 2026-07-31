import { parseFechaLocal } from '@/lib/urgencia';
import type { TipoFrecuencia } from '@/lib/types/database';

type TareaParaVencimiento = {
  tipo_frecuencia: TipoFrecuencia;
  ultima_ejecucion: string | null;
  frecuencia_dias: number | null;
  dias_semana: number[] | null;
  created_at: string;
};

function hoyLocal(): Date {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

// Si nunca se ha marcado como hecha, la base es la fecha de creación:
// la primera fecha "objetivo" es creación + frecuencia, no hoy mismo
// (si no, toda tarea nueva nacería ya vencida).
export function calcularProximaFecha(tarea: TareaParaVencimiento): Date {
  if (tarea.tipo_frecuencia === 'dias_semana' && tarea.dias_semana && tarea.dias_semana.length > 0) {
    const diasValidos = new Set(tarea.dias_semana);

    // Si ya se hizo, la próxima ocurrencia arranca al día siguiente;
    // si nunca se ha hecho, hoy mismo cuenta si su día de semana aplica.
    let candidato: Date;
    if (tarea.ultima_ejecucion) {
      candidato = parseFechaLocal(tarea.ultima_ejecucion);
      candidato.setDate(candidato.getDate() + 1);
    } else {
      candidato = hoyLocal();
    }

    for (let i = 0; i < 7; i++) {
      if (diasValidos.has(candidato.getDay())) return candidato;
      candidato.setDate(candidato.getDate() + 1);
    }
    return candidato;
  }

  const base = parseFechaLocal(tarea.ultima_ejecucion ?? tarea.created_at.slice(0, 10));
  base.setDate(base.getDate() + (tarea.frecuencia_dias ?? 0));
  return base;
}

export { calcularDiasRestantes, clasificarUrgencia, etiquetaUrgencia, type Urgencia } from '@/lib/urgencia';
