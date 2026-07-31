import { parseFechaLocal } from '@/lib/urgencia';
import type { Database } from '@/lib/types/database';

type ItemParaVencimiento = Pick<
  Database['public']['Tables']['items_refri']['Row'],
  'tipo_tracking' | 'fecha_entrada' | 'fecha_caducidad' | 'dias_estimados'
>;

export function calcularFechaVencimiento(item: ItemParaVencimiento): Date {
  if (item.tipo_tracking === 'fecha' && item.fecha_caducidad) {
    return parseFechaLocal(item.fecha_caducidad);
  }

  const entrada = parseFechaLocal(item.fecha_entrada);
  entrada.setDate(entrada.getDate() + (item.dias_estimados ?? 0));
  return entrada;
}

export { calcularDiasRestantes, clasificarUrgencia, etiquetaUrgencia, type Urgencia } from '@/lib/urgencia';
