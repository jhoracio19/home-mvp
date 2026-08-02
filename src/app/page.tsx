import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buttonClasses } from '@/components/ui/Button';
import { Logomark } from '@/components/landing/Logomark';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

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

function MockupCompras() {
  const items = [
    { nombre: 'Leche', comprado: false },
    { nombre: 'Papel de baño', comprado: false },
    { nombre: 'Plátano', comprado: true },
  ];
  return (
    <div className="w-full max-w-sm space-y-2">
      {items.map((item) => (
        <div
          key={item.nombre}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm ${
            item.comprado ? 'border-camel/50 bg-khaki/40' : 'border-camel bg-khaki'
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              item.comprado ? 'border-cocoa bg-cocoa text-linen' : 'border-camel'
            }`}
          >
            {item.comprado && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <span className={`text-sm font-medium ${item.comprado ? 'text-cocoa/50 line-through' : 'text-cocoa'}`}>
            {item.nombre}
          </span>
        </div>
      ))}
    </div>
  );
}

function MockupGastos() {
  const balances = [
    { nombre: 'Ana', monto: '$450', positivo: true },
    { nombre: 'Luis', monto: '$450', positivo: false },
  ];
  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3">
      {balances.map((b) => (
        <div key={b.nombre} className="rounded-lg border border-camel bg-khaki p-4 shadow-sm">
          <p className="truncate text-xs font-semibold text-cocoa">{b.nombre}</p>
          <p className={`mt-1 text-lg font-bold ${b.positivo ? 'text-[#6B8F5A]' : 'text-[#a8422e]'}`}>{b.monto}</p>
          <p className="text-[0.65rem] font-medium uppercase tracking-wide text-cocoa/60">
            {b.positivo ? 'le deben' : 'debe'}
          </p>
        </div>
      ))}
    </div>
  );
}

function MockupNotas() {
  return (
    <div className="w-full max-w-sm rounded-lg border-2 border-camel bg-khaki p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-camel">Notas de la casa</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-cocoa">
        {'Wifi: MiCasa2024\nClave: ****\n\nNo fiestas después de las 11pm\n\nEmergencias: portero 555-123-4567'}
      </p>
    </div>
  );
}

function MockupAvisos() {
  const avisos = [
    { titulo: 'Nueva tarea asignada', cuerpo: 'Te asignaron: Sacar la basura' },
    { titulo: 'RemindHome', cuerpo: 'Plátano vence hoy' },
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
      <SiteHeader />

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
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B8F5A]" />
            Se actualiza en vivo entre todos los de la casa, sin recargar la página.
          </p>
        </div>

        <TelefonoRefri />
      </section>

      {/* Refri */}
      <section id="refri" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 px-4 py-14 sm:px-8">
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

      {/* Compras */}
      <section id="compras" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Compras</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              La lista del súper que todos pueden ver y tachar
            </h2>
            <p className="text-cocoa">
              Cuando algo se está acabando en el refri, mándalo a la lista con un clic. Cualquiera en la casa
              agrega, tacha lo que ya compró, y de un botón limpian lo comprado para el siguiente viaje. Si tú
              estás en el súper y alguien agrega algo desde la casa, te aparece al instante.
            </p>
          </div>
          <div className="flex justify-center">
            <MockupCompras />
          </div>
        </div>
      </section>

      {/* Gastos */}
      <section id="gastos" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupGastos />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Gastos</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              Renta, luz, súper — sin llevar la cuenta en la cabeza
            </h2>
            <p className="text-cocoa">
              Registra qué se pagó y quién lo pagó; la app reparte en partes iguales entre todos y te dice al
              instante quién va ganando y quién debe. Nada de recibos perdidos en el chat.
            </p>
          </div>
        </div>
      </section>

      {/* Tareas */}
      <section id="tareas" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Tareas</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              Repártanse lo de la casa sin repetir la misma discusión cada semana
            </h2>
            <p className="text-cocoa">
              Crea tareas que se repiten cada tantos días, o en días fijos de la semana — lavar trastes lunes,
              miércoles y viernes, por ejemplo. Asígnalas a quien le toque; al marcarlas como hechas, la app calcula
              sola cuándo vuelven a tocar, y todos lo ven reflejado al momento, sin recargar nada.
            </p>
          </div>
          <div className="flex justify-center">
            <MockupTareas />
          </div>
        </div>
      </section>

      {/* Notas */}
      <section id="notas" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupNotas />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Notas</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">
              La contraseña del wifi, en un solo lugar — no en el chat de hace 3 meses
            </h2>
            <p className="text-cocoa">
              Una nota compartida por casa para lo que todos necesitan a la mano: wifi, reglas, contactos de
              emergencia. Cualquiera la puede editar, sin tener que andarla buscando en el chat.
            </p>
          </div>
        </div>
      </section>

      {/* Avisos */}
      <section id="avisos" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 px-4 py-14 sm:px-8">
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
              {
                paso: '2',
                texto: 'Agreguen lo del refri, la lista de compras, las tareas, los gastos y las notas de la casa.',
              },
              { paso: '3', texto: 'Repártanse, marquen, tachen, paguen — y dejen que la app avise y actualice a todos en vivo.' },
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

      {/* Próximamente */}
      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border-2 border-dashed border-camel bg-khaki/40 p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Próximamente</p>
          <h2 className="mt-2 text-2xl font-bold text-espresso sm:text-3xl">Esto apenas empieza</h2>
          <p className="mx-auto mt-3 max-w-md text-cocoa">
            Seguimos construyendo más para el hogar — notificaciones más a tu medida, y lo que ustedes nos vayan
            pidiendo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Notificaciones a tu medida', 'Más módulos para la casa'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-camel bg-linen px-3 py-1.5 text-xs font-semibold text-cocoa"
              >
                {item}
              </span>
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

      <SiteFooter />
    </div>
  );
}
