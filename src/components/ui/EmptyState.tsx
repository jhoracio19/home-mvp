import type { ReactNode } from 'react';

// Estado vacío estándar (antes copiado a mano en 6 páginas).
// `accion` acepta un <Link> o botón ya estilizado para invitar al
// primer paso en vez de dejar un callejón sin salida.
export function EmptyState({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-dashed border-camel bg-khaki/50 p-6 text-center shadow-sm dark:bg-espresso-deep/60">
      <p className="text-sm font-medium text-cocoa dark:text-khaki">{titulo}</p>
      {descripcion && <p className="text-xs text-cocoa/70 dark:text-khaki/70">{descripcion}</p>}
      {accion && <div className="flex justify-center">{accion}</div>}
    </div>
  );
}
