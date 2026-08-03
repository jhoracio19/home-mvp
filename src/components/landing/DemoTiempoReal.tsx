type Props = {
  nombreYo: string;
  nombreOtro: string;
  tarea: string;
  badgePendiente: string;
  badgeHecho: string;
};

function Telefono({
  nombre,
  esOtro,
  tarea,
  badgePendiente,
  badgeHecho,
}: {
  nombre: string;
  esOtro: boolean;
  tarea: string;
  badgePendiente: string;
  badgeHecho: string;
}) {
  return (
    <div className="w-full max-w-[190px] rounded-[1.75rem] border-[5px] border-espresso bg-espresso p-1 shadow-xl">
      <div className="overflow-hidden rounded-[1.35rem] bg-linen">
        <div className="bg-espresso px-3 py-2.5">
          <p className="text-[0.6rem] text-khaki">{nombre}</p>
        </div>
        <div className="p-2.5">
          <div className={`rounded-lg border-2 border-camel bg-khaki p-2.5 ${esOtro ? 'demo-tarjeta-otro' : ''}`}>
            <div className="flex items-center gap-2">
              <span className="demo-checkbox h-4 w-4 shrink-0 rounded-full border-2" />
              <span className="min-w-0 flex-1 truncate text-[0.65rem] font-semibold text-cocoa">{tarea}</span>
              {/* Las dos etiquetas ocupan la misma celda de grid — así el
                  ancho reservado siempre es el de la más grande, y el
                  texto de la tarea (flex-1) sabe hasta dónde truncar sin
                  encimarse, en vez de adivinar con posición absoluta. */}
              <span className="grid shrink-0 justify-items-end">
                <span className="demo-badge-pendiente col-start-1 row-start-1 whitespace-nowrap rounded-full bg-white/70 px-1.5 py-0.5 text-[0.5rem] font-bold text-cocoa">
                  {badgePendiente}
                </span>
                <span className="demo-badge-hecho col-start-1 row-start-1 whitespace-nowrap rounded-full bg-[#6B8F5A]/20 px-1.5 py-0.5 text-[0.5rem] font-bold text-[#6B8F5A]">
                  {badgeHecho}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Puro CSS (ver globals.css): el segundo teléfono repite la misma
// animación que el primero con un pequeño retraso, para que se vea
// como si el cambio le "llegara" solo — nada de JS ni WebSocket de
// mentiras, solo la sensación visual de lo que la app ya hace de
// verdad con Supabase Realtime.
export function DemoTiempoReal({ nombreYo, nombreOtro, tarea, badgePendiente, badgeHecho }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      <Telefono nombre={nombreYo} esOtro={false} tarea={tarea} badgePendiente={badgePendiente} badgeHecho={badgeHecho} />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-camel">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
      <Telefono nombre={nombreOtro} esOtro tarea={tarea} badgePendiente={badgePendiente} badgeHecho={badgeHecho} />
    </div>
  );
}
