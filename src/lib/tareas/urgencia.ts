import { parseFechaLocal } from '@/lib/urgencia';

type TareaParaVencimiento = {
  ultima_ejecucion: string | null;
  frecuencia_dias: number;
  created_at: string;
};

// Si nunca se ha marcado como hecha, la base es la fecha de creación:
// la primera fecha "objetivo" es creación + frecuencia, no hoy mismo
// (si no, toda tarea nueva nacería ya vencida).
export function calcularProximaFecha(tarea: TareaParaVencimiento): Date {
  const base = parseFechaLocal(tarea.ultima_ejecucion ?? tarea.created_at.slice(0, 10));
  base.setDate(base.getDate() + tarea.frecuencia_dias);
  return base;
}

export { calcularDiasRestantes, clasificarUrgencia, etiquetaUrgencia, type Urgencia } from '@/lib/urgencia';
