import { getLocale, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { buttonClasses } from '@/components/ui/Button';
import { Logomark } from '@/components/landing/Logomark';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { DemoTiempoReal } from '@/components/landing/DemoTiempoReal';
import { StickyCTA } from '@/components/landing/StickyCTA';

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

type Traductor = Awaited<ReturnType<typeof getTranslations>>;

type Traductores = {
  t: Traductor;
  tUrgencia: Traductor;
  tCategorias: Traductor;
  tGastos: Traductor;
  tTareas: Traductor;
  tNav: Traductor;
  tNotas: Traductor;
  tRefri: Traductor;
};

function TelefonoRefri({ t, tUrgencia, tCategorias, tNav, tRefri }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2.25rem] border-[6px] border-espresso bg-espresso p-1.5 shadow-2xl">
      <div className="overflow-hidden rounded-[1.6rem]">
        <div className="bg-espresso px-4 pb-3 pt-5">
          <p className="text-xs font-semibold text-linen">{m.nombreCasa}</p>
          <p className="text-[0.65rem] text-khaki">{tNav('saludo', { nombre: 'Ana' })}</p>
        </div>
        <div className="space-y-2 bg-linen px-3 py-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-camel">
              {t('refri.eyebrow')}
            </p>
            <span className="rounded-md bg-cocoa px-2 py-1 text-[0.55rem] font-bold text-linen">{tRefri('agregar')}</span>
          </div>

          {[
            { nombre: m.leche, cat: 'lacteo', dueno: m.duenoAna, badge: tUrgencia('vencioHace', { dias: 1 }), estilo: URGENCIA.vencido },
            { nombre: m.platano, cat: 'fruta', dueno: null, badge: tUrgencia('venceHoy'), estilo: URGENCIA.hoy },
            { nombre: m.pechugaDePollo, cat: 'carne', dueno: m.duenoLuis, badge: tUrgencia('venceEn', { dias: 4 }), estilo: URGENCIA.normal },
          ].map((item) => (
            <div key={item.nombre} className={`rounded-lg border-2 p-2.5 ${item.estilo}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.7rem] font-semibold text-cocoa">{item.nombre}</p>
                  <span
                    className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide ${CATEGORIA[item.cat as keyof typeof CATEGORIA]}`}
                  >
                    {tCategorias(item.cat)}
                  </span>
                  {item.dueno && (
                    <span className="ml-1 mt-1 inline-block rounded-full border border-cocoa/40 bg-white/50 px-1.5 py-0.5 text-[0.5rem] font-bold text-cocoa">
                      {item.dueno}
                    </span>
                  )}
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

function MockupTareas({ t, tUrgencia, tTareas }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  const tareas = [
    { nombre: m.sacarLaBasura, detalle: m.detalleSacarBasura, badge: tUrgencia('venceHoy'), estilo: URGENCIA.hoy },
    {
      nombre: m.lavarTrastes,
      detalle: m.detalleLavarTrastes,
      badge: tUrgencia('venceEn', { dias: 2 }),
      estilo: URGENCIA.normal,
    },
    {
      nombre: m.tareaUnicaNombre,
      detalle: `${tTareas('fechaLimite', { fecha: m.fechaEventoEjemplo })} · ${m.duenoAna}`,
      badge: tUrgencia('venceEn', { dias: 6 }),
      estilo: URGENCIA.normal,
    },
  ];
  return (
    <div className="w-full max-w-sm space-y-3">
      {tareas.map((tarea, i) => (
        <div key={tarea.nombre} className={`rounded-lg border-2 p-3 shadow-sm ${tarea.estilo}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cocoa">{tarea.nombre}</p>
              <p className="text-xs font-medium text-cocoa/70">{tarea.detalle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-cocoa">
              {tarea.badge}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
            <span
              className={`rounded-lg bg-cocoa px-3 py-1.5 text-linen ${i === 0 ? 'demo-boton-pulso' : ''}`}
            >
              {tTareas('marcarHecho')}
            </span>
            <span className="text-camel">{tTareas('editar')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockupCompras({ t }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  const items = [
    { nombre: m.leche, comprado: false },
    { nombre: m.papelDeBano, comprado: false },
    { nombre: m.platano, comprado: true },
  ];
  return (
    <div className="w-full max-w-sm space-y-2">
      {items.map((item, i) => {
        const animado = i === 0 && !item.comprado;
        return (
          <div
            key={item.nombre}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm ${
              item.comprado ? 'border-camel/50 bg-khaki/40' : 'border-camel bg-khaki'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-linen ${
                animado
                  ? 'demo-compras-checkbox border-2'
                  : item.comprado
                    ? 'border-2 border-cocoa bg-cocoa'
                    : 'border-2 border-camel'
              }`}
            >
              {item.comprado && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {animado && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="demo-compras-check h-3 w-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className={`text-sm font-medium ${item.comprado ? 'text-cocoa/50 line-through' : 'text-cocoa'}`}>
              {item.nombre}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MockupGastos({ t, tGastos }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  const balances = [
    { nombre: 'Ana', monto: '$450', positivo: true },
    { nombre: 'Luis', monto: '$450', positivo: false },
  ];
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-dashed border-camel bg-linen px-4 py-2">
        <span className="text-xs font-semibold text-cocoa/70">{m.mesEjemplo}</span>
        <span className="text-sm font-bold text-cocoa">$1,850</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {balances.map((b) => (
          <div key={b.nombre} className="rounded-lg border border-camel bg-khaki p-4 shadow-sm">
            <p className="truncate text-xs font-semibold text-cocoa">{b.nombre}</p>
            <p className={`mt-1 text-lg font-bold ${b.positivo ? 'text-[#6B8F5A]' : 'text-[#a8422e]'}`}>{b.monto}</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-cocoa/60">
              {b.positivo ? tGastos('leDeben') : tGastos('debe')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupLogros({ tTareas }: Traductores) {
  return (
    <div className="flex w-full max-w-sm items-center gap-4 rounded-lg border border-camel bg-khaki p-4 shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 shrink-0 text-camel">
        <circle cx="12" cy="8" r="6" />
        <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
      </svg>
      <div className="flex gap-6">
        <div>
          <p className="text-lg font-bold text-cocoa">12</p>
          <p className="text-xs text-cocoa/70">{tTareas('tareaATiempo', { n: 12 })}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-lg font-bold text-cocoa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="demo-flama h-4 w-4 text-[#c9702f]">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
            </svg>
            5
          </p>
          <p className="text-xs text-cocoa/70">{tTareas('rachaSeguida')}</p>
        </div>
      </div>
    </div>
  );
}

function MockupNotas({ t, tNotas }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  return (
    <div className="w-full max-w-sm rounded-lg border-2 border-camel bg-khaki p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-camel">{tNotas('titulo')}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-cocoa">{m.notasContenido}</p>
    </div>
  );
}

function MockupAvisos({ t }: Traductores) {
  const m = t.raw('mockup') as Record<string, string>;
  const avisos = [
    { titulo: m.avisoTareaTitulo, cuerpo: m.avisoTareaCuerpo },
    { titulo: 'RemindHome', cuerpo: m.avisoRefriCuerpo },
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

  const [t, tUrgencia, tCategorias, tGastos, tTareas, tNav, tNotas, tRefri, locale] = await Promise.all([
    getTranslations('Landing'),
    getTranslations('Urgencia'),
    getTranslations('Categorias'),
    getTranslations('Gastos'),
    getTranslations('Tareas'),
    getTranslations('Nav'),
    getTranslations('Notas'),
    getTranslations('Refri'),
    getLocale() as Promise<Locale>,
  ]);

  if (user) redirect({ href: '/casas', locale });

  const traductores: Traductores = { t, tUrgencia, tCategorias, tGastos, tTareas, tNav, tNotas, tRefri };

  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('hero.eyebrow')}</p>
          <h1 className="text-3xl font-bold leading-tight text-espresso sm:text-4xl">{t('hero.titulo')}</h1>
          <p className="text-base text-cocoa sm:text-lg">{t('hero.descripcion')}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/signup" className={buttonClasses('primary', 'w-full sm:w-auto')}>
              {t('crearCuentaGratis')}
            </Link>
            <Link href="/login" className={buttonClasses('secondary', 'w-full sm:w-auto')}>
              {t('hero.yaTengoCuenta')}
            </Link>
          </div>
          <StickyCTA texto={t('crearCuentaGratis')} />
          <p className="text-xs text-cocoa/70">{t('hero.esGratis')}</p>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B8F5A]" />
            {t('hero.tiempoReal')}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.25 21.3 7.31 24 12 24Z" />
              <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1Z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
            </svg>
            {t('hero.google')}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
              <path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z" />
            </svg>
            {t('hero.sinAnuncios')}
          </p>
        </div>

        <TelefonoRefri {...traductores} />
      </section>

      {/* Demo de tiempo real */}
      <section className="border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('tiempoReal.titulo')}</h2>
          <p className="mx-auto mt-3 max-w-md text-cocoa">{t('tiempoReal.descripcion')}</p>
          <div className="mt-8">
            <DemoTiempoReal
              nombreYo={t('tiempoReal.nombreYo')}
              nombreOtro={t('tiempoReal.nombreOtro')}
              tarea={t('tiempoReal.tarea')}
              badgePendiente={t('tiempoReal.badgePendiente')}
              badgeHecho={t('tiempoReal.badgeHecho')}
            />
          </div>
        </div>
      </section>

      {/* Refri */}
      <section id="refri" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 textura-puntos px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <div className="w-full max-w-sm space-y-3">
              {[
                {
                  nombre: t.raw('mockup').leche,
                  cat: 'lacteo',
                  dueno: t.raw('mockup').duenoAna,
                  badge: tUrgencia('vencioHace', { dias: 1 }),
                  estilo: URGENCIA.vencido,
                },
                {
                  nombre: t.raw('mockup').platano,
                  cat: 'fruta',
                  dueno: null,
                  badge: tUrgencia('venceHoy'),
                  estilo: URGENCIA.hoy,
                },
              ].map((item) => (
                <div key={item.nombre} className={`rounded-lg border-2 p-4 shadow-sm ${item.estilo}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-cocoa">{item.nombre}</p>
                      <span
                        className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${CATEGORIA[item.cat as keyof typeof CATEGORIA]}`}
                      >
                        {tCategorias(item.cat)}
                      </span>
                      {item.dueno && (
                        <span className="ml-1.5 mt-1 inline-block rounded-full border border-cocoa/40 bg-white/50 px-2 py-0.5 text-[0.65rem] font-bold text-cocoa">
                          {item.dueno}
                        </span>
                      )}
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('refri.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('refri.titulo')}</h2>
            <p className="text-cocoa">{t('refri.descripcion')}</p>
          </div>
        </div>
      </section>

      {/* Compras */}
      <section id="compras" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('compras.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('compras.titulo')}</h2>
            <p className="text-cocoa">{t('compras.descripcion')}</p>
          </div>
          <div className="flex justify-center">
            <MockupCompras {...traductores} />
          </div>
        </div>
      </section>

      {/* Gastos */}
      <section id="gastos" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupGastos {...traductores} />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('gastos.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('gastos.titulo')}</h2>
            <p className="text-cocoa">{t('gastos.descripcion')}</p>
          </div>
        </div>
      </section>

      {/* Tareas */}
      <section id="tareas" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 textura-puntos px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('tareas.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('tareas.titulo')}</h2>
            <p className="text-cocoa">{t('tareas.descripcion')}</p>
          </div>
          <div className="flex justify-center">
            <MockupTareas {...traductores} />
          </div>
        </div>
      </section>

      {/* Logros */}
      <section id="logros" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('logros.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('logros.titulo')}</h2>
            <p className="text-cocoa">{t('logros.descripcion')}</p>
          </div>
          <div className="flex justify-center">
            <MockupLogros {...traductores} />
          </div>
        </div>
      </section>

      {/* Notas */}
      <section id="notas" className="scroll-mt-20 border-t border-camel/40 px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupNotas {...traductores} />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('notas.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('notas.titulo')}</h2>
            <p className="text-cocoa">{t('notas.descripcion')}</p>
          </div>
        </div>
      </section>

      {/* Avisos */}
      <section id="avisos" className="scroll-mt-20 border-t border-camel/40 bg-khaki/30 textura-puntos px-4 py-14 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1">
            <MockupAvisos {...traductores} />
          </div>
          <div className="order-1 space-y-4 text-center lg:order-2 lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('avisos.eyebrow')}</p>
            <h2 className="text-2xl font-bold text-espresso sm:text-3xl">{t('avisos.titulo')}</h2>
            <p className="text-cocoa">{t('avisos.descripcion')}</p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-espresso sm:text-3xl">{t('comoFunciona.titulo')}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                paso: 1,
                texto: t('comoFunciona.paso1'),
                icono: (
                  <>
                    <path d="M3 11 12 3l9 8" />
                    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
                  </>
                ),
              },
              {
                paso: 2,
                texto: t('comoFunciona.paso2'),
                icono: (
                  <>
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <polyline points="8 12 11 15 16 9" />
                  </>
                ),
              },
              {
                paso: 3,
                texto: t('comoFunciona.paso3'),
                icono: (
                  <>
                    <path d="M21 12a9 9 0 1 1-3-6.7" />
                    <polyline points="21 3 21 9 15 9" />
                  </>
                ),
              },
            ].map(({ paso, texto, icono }) => (
              <div key={paso} className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-camel">
                  {t('comoFunciona.paso', { n: paso })}
                </p>
                <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-espresso text-linen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    {icono}
                  </svg>
                </div>
                <p className="mt-3 text-sm text-cocoa">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparación / objeción típica */}
      <section className="border-t border-camel/40 bg-khaki/30 textura-puntos px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('comparacion.eyebrow')}</p>
            <h2 className="mt-1 text-2xl font-bold text-espresso sm:text-3xl">{t('comparacion.titulo')}</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { titulo: t('comparacion.splitwiseTitulo'), descripcion: t('comparacion.splitwiseDescripcion') },
              { titulo: t('comparacion.notionTitulo'), descripcion: t('comparacion.notionDescripcion') },
              { titulo: t('comparacion.whatsappTitulo'), descripcion: t('comparacion.whatsappDescripcion') },
            ].map((item) => (
              <div key={item.titulo} className="rounded-lg border border-camel bg-linen p-5 shadow-sm">
                <h3 className="font-bold text-cocoa">{item.titulo}</h3>
                <p className="mt-2 text-sm text-cocoa/80">{item.descripcion}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-semibold text-cocoa">
            {t('comparacion.cierre')}
          </p>
        </div>
      </section>

      {/* Próximamente */}
      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border-2 border-dashed border-camel bg-khaki/40 p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('proximamente.eyebrow')}</p>
          <h2 className="mt-2 text-2xl font-bold text-espresso sm:text-3xl">{t('proximamente.titulo')}</h2>
          <p className="mx-auto mt-3 max-w-md text-cocoa">{t('proximamente.descripcion')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[t('proximamente.chip1'), t('proximamente.chip2')].map((item) => (
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
        <h2 className="text-2xl font-bold text-linen sm:text-3xl">{t('cta.titulo')}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-khaki">{t('cta.descripcion')}</p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-linen px-4 text-base font-semibold text-espresso shadow-sm transition-colors hover:bg-khaki active:bg-camel"
        >
          {t('crearCuentaGratis')}
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
