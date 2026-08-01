import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buttonClasses } from '@/components/ui/Button';

// Mismas clases que dashboard/page.tsx y tareas/page.tsx — los mockups
// de abajo son una reproducción fiel del look real, no una versión
// "de mercadeo" con colores inventados.
const URGENCIA = {
  vencido: 'border-[#a8422e] bg-[#a8422e]/10 text-[#a8422e]',
  hoy: 'border-[#c9702f] bg-[#c9702f]/10 text-[#c9702f]',
  normal: 'border-camel bg-khaki text-cocoa',
};

const CATEGORIA = {
  lacteo: 'border-[#6E93A8]/50 bg-[#6E93A8]/15 text-[#6E93A8]',
  fruta: 'border-[#E08E45]/50 bg-[#E08E45]/15 text-[#E08E45]',
  carne: 'border-[#B4573F]/50 bg-[#B4573F]/15 text-[#B4573F]',
};

function Logomark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className}>
      <rect x="0" y="0" width="512" height="512" rx="112" fill="#F5F1EA" />
      <path d="M256 100 L376 200 L376 400 L136 400 L136 200 Z" fill="#7D5A44" />
    </svg>
  );
}

function TelefonoRefri() {
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2.25rem] border-[6px] border-espresso bg-espresso p-1.5 shadow-2xl">
      <div className="overflow-hidden rounded-[1.6rem]">
        <div className="bg-espresso px-4 pb-3 pt-5">
          <p className="text-xs font-semibold text-linen">Depa entre amigos</p>
          <p className="text-[0.65rem] text-khaki">Hola, Ana</p>
        </div>
        <div className="space-y-2 bg-linen px-3 py-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-camel">Refri</p>
            <span className="rounded-md bg-cocoa px-2 py-1 text-[0.55rem] font-bold text-linen">+ Agregar</span>
          </div>

          {[
            { nombre: 'Leche', cat: 'lacteo', catLabel: 'LÁCTEO', badge: 'Venció hace 1 día', estilo: URGENCIA.vencido },
            { nombre: 'Plátano', cat: 'fruta', catLabel: 'FRUTA', badge: 'Vence hoy', estilo: URGENCIA.hoy },
            { nombre: 'Pechuga de pollo', cat: 'carne', catLabel: 'CARNE', badge: 'Vence en 4 días', estilo: URGENCIA.normal },
          ].map((item) => (
            <div key={item.nombre} className={`rounded-lg border-2 p-2.5 ${item.estilo}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.7rem] font-semibold text-cocoa">{item.nombre}</p>
                  <span
                    className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[0.5rem] font-bold tracking-wide ${CATEGORIA[item.cat as keyof typeof CATEGORIA]}`}
                  >
                    {item.catLabel}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[0.55rem] font-bold text-cocoa">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupTareas() {
  const tareas = [
    { nombre: 'Sacar la basura', detalle: 'Sáb · Ana', badge: 'Vence hoy', estilo: URGENCIA.hoy },
    { nombre: 'Lavar trastes', detalle: 'Lun, Mié, Vie · Luis', badge: 'Vence en 2 días', estilo: URGENCIA.normal },
  ];
  return (
    <div className="w-full max-w-sm space-y-3">
      {tareas.map((t) => (
        <div key={t.nombre} className={`rounded-lg border-2 p-3 shadow-sm ${t.estilo}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cocoa">{t.nombre}</p>
              <p className="text-xs font-medium text-cocoa/70">{t.detalle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-cocoa">
              {t.badge}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
            <span className="rounded-lg bg-cocoa px-3 py-1.5 text-linen">Marcar hecho</span>
            <span className="text-camel">Editar</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockupAvisos() {
  const avisos = [
    { titulo: 'Nueva tarea asignada', cuerpo: 'Te asignaron: Sacar la basura' },
    { titulo: 'Gestión doméstica', cuerpo: 'Plátano vence hoy' },
  ];
  return (
    <div className="w-full max-w-sm space-y-3">
      {avisos.map((a) => (
        <div key={a.titulo} className="flex items-start gap-3 rounded-xl border border-camel bg-khaki p-3 shadow-md">
          <Logomark className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-espresso">{a.titulo}</p>
            <p className="truncate text-xs text-cocoa">{a.cuerpo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/casas');

  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Logomark className="h-8 w-8 rounded-lg" />
          <span className="text-sm font-bold text-espresso">Gestión doméstica</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-1.5 text-sm font-semibold text-cocoa hover:underline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Iniciar sesión
          </Link>
          <Link href="/signup" className={buttonClasses('primary', 'min-h-9 gap-1.5 px-3 text-sm')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="16" y1="11" x2="22" y2="11" />
            </svg>
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">
            Refri y tareas del hogar, en una sola app
          </p>
          <h1 className="text-3xl font-bold leading-tight text-espresso sm:text-4xl">
            Que nadie vuelva a preguntar qué hay que tirar del refri, ni a quién le tocaba sacar la basura.
          </h1>
          <p className="text-base text-cocoa sm:text-lg">
            Registra lo que tienen en el refri y las tareas que se repiten cada semana. La app avisa —a ti y a
            quien le toque— antes de que algo se eche a perder o se les pase una tarea.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/signup" className={buttonClasses('primary', 'w-full sm:w-auto')}>
              Crear cuenta gratis
            </Link>
            <Link href="/login" className={buttonClasses('secondary', 'w-full sm:w-auto')}>
              Ya tengo cuenta
            </Link>
          </div>
          <p className="text-xs text-cocoa/70">Gratis. Se instala como app en tu celular, sin tienda de por medio.</p>
        </div>

        <TelefonoRefri />
      </section>

      {/* Refri */}
      <section id="refri" className="border-t border-camel/40 bg-khaki/30 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <div className="w-full max-w-sm space-y-3">
              {[
                { nombre: 'Leche', cat: 'lacteo', catLabel: 'LÁCTEO', badge: 'Venció hace 1 día', estilo: URGENCIA.vencido },
                { nombre: 'Plátano', cat: 'fruta', catLabel: 'FRUTA', badge: 'Vence hoy', estilo: URGENCIA.hoy },
              ].map((item) => (
                <div key={item.nombre} className={`rounded-lg border-2 p-4 shadow-sm ${item.estilo}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-cocoa">{item.nombre}</p>
                      <span
                        className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.65rem] font-bold tracking-wide ${CATEGORIA[item.cat as keyof typeof CATEGORIA]}`}
                      >
                        {item.catLabel}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-cocoa">
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Refri</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              Sabe qué va a caducar antes de abrir el refri
            </h2>
            <p className="text-cocoa">
              Agrega lo que compran — frutas y verduras se autocompletan con cuánto suelen durar. Cada producto se
              acomoda solo según qué tan urgente esté: vencido, vence hoy, o todavía hay tiempo.
            </p>
          </div>
        </div>
      </section>

      {/* Tareas */}
      <section id="tareas" className="px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Tareas</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              Repártanse lo de la casa sin repetir la misma discusión cada semana
            </h2>
            <p className="text-cocoa">
              Crea tareas que se repiten cada tantos días, o en días fijos de la semana — lavar trastes lunes,
              miércoles y viernes, por ejemplo. Asígnalas a quien le toque; al marcarlas como hechas, la app calcula
              sola cuándo vuelven a tocar.
            </p>
          </div>
          <div className="flex justify-center">
            <MockupTareas />
          </div>
        </div>
      </section>

      {/* Avisos */}
      <section id="avisos" className="border-t border-camel/40 bg-khaki/30 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupAvisos />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Avisos</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              Te avisamos nosotros, tú no tienes que acordarte
            </h2>
            <p className="text-cocoa">
              En cuanto alguien te asigna una tarea, te llega la notificación al momento. Cada mañana, un resumen de
              lo que vence en el refri y lo que te toca ese día — directo a tu celular, como cualquier otra app.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-espresso sm:text-3xl">Cómo funciona</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { paso: '1', texto: 'Crea tu casa, o únete con el código que te compartan.' },
              { paso: '2', texto: 'Agreguen lo que hay en el refri y las tareas de siempre.' },
              { paso: '3', texto: 'Repártanse, marquen como hecho, y dejen que la app avise.' },
            ].map(({ paso, texto }) => (
              <div key={paso} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-sm font-bold text-linen">
                  {paso}
                </div>
                <p className="mt-3 text-sm text-cocoa">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-camel/40 bg-espresso px-4 py-14 text-center sm:px-8">
        <h2 className="text-2xl font-bold text-linen sm:text-3xl">Empieza en menos de un minuto</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-khaki">
          Sin tarjeta, sin instalación complicada — se agrega a tu pantalla de inicio como cualquier app.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-linen px-4 text-base font-semibold text-espresso shadow-sm transition-colors hover:bg-khaki active:bg-camel"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="border-t border-camel/40 bg-linen px-4 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs space-y-3 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Logomark className="h-7 w-7 rounded-md" />
              <span className="text-sm font-bold text-espresso">Gestión doméstica</span>
            </div>
            <p className="text-sm text-cocoa/70">
              El refri y las tareas del hogar, organizados y sin que tengas que acordarte tú.
            </p>
          </div>

          <div className="flex justify-center gap-10 sm:justify-end">
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-camel">Producto</p>
              <ul className="space-y-1.5 text-sm text-cocoa">
                <li>
                  <Link href="#refri" className="flex items-center justify-center gap-1.5 hover:underline sm:justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <rect x="5" y="2" width="14" height="20" rx="2" />
                      <line x1="5" y1="10" x2="19" y2="10" />
                      <line x1="8" y1="5" x2="8" y2="7" />
                      <line x1="8" y1="13" x2="8" y2="15" />
                    </svg>
                    Refri
                  </Link>
                </li>
                <li>
                  <Link href="#tareas" className="flex items-center justify-center gap-1.5 hover:underline sm:justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <polyline points="8 12 11 15 16 9" />
                    </svg>
                    Tareas
                  </Link>
                </li>
                <li>
                  <Link href="#avisos" className="flex items-center justify-center gap-1.5 hover:underline sm:justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    Avisos
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-camel">Cuenta</p>
              <ul className="space-y-1.5 text-sm text-cocoa">
                <li>
                  <Link href="/login" className="flex items-center justify-center gap-1.5 hover:underline sm:justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="flex items-center justify-center gap-1.5 hover:underline sm:justify-start">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="16" y1="11" x2="22" y2="11" />
                    </svg>
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-5xl border-t border-camel/30 pt-4 text-center text-xs text-cocoa/60 sm:text-left">
          © {new Date().getFullYear()} Gestión doméstica
        </div>
      </footer>
    </div>
  );
}
