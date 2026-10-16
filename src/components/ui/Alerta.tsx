export type AlertaVariante = 'error' | 'exito' | 'info';

const variantes: Record<AlertaVariante, string> = {
  error:
    'border-danger bg-danger/10 text-danger dark:border-danger-soft dark:bg-danger/20 dark:text-danger-soft',
  exito:
    'border-success bg-success/10 text-success dark:border-success dark:bg-success/20',
  info: 'border-camel bg-khaki/50 text-cocoa dark:border-cocoa dark:bg-espresso-deep dark:text-khaki',
};

// Banner de feedback unificado (antes había dos sistemas de error
// distintos conviviendo, con hex sueltos por página).
export function Alerta({ variante = 'info', children }: { variante?: AlertaVariante; children: React.ReactNode }) {
  return (
    <p role={variante === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${variantes[variante]}`}>
      {children}
    </p>
  );
}
