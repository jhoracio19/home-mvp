'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';

// Chrome/Edge (Android y desktop) disparan este evento cuando la PWA
// es instalable — lo capturamos para ofrecer un botón de un toque en
// vez de solo instrucciones. Safari (iOS y desktop) nunca lo dispara:
// Apple no expone una API para esto, así que ahí siempre es manual.
type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Plataforma = 'ios' | 'android' | 'desktop';

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

// En iOS, "Agregar a inicio" solo existe en Safari — Chrome/Firefox
// para iPhone y los navegadores dentro de otras apps (Instagram,
// WhatsApp) corren sobre el mismo motor, pero Apple no les da esa
// opción. Sin este aviso, alguien ahí buscaría el botón para siempre.
function abrioDesdeNavegadorSinInstalarEnIOS(): boolean {
  const ua = navigator.userAgent;
  const esIOS = /iPhone|iPad|iPod/.test(ua);
  const noEsSafari = /CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV|Line\//.test(ua);
  return esIOS && noEsSafari;
}

const iconosPaso = {
  compartir: (
    <>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <rect x="4" y="12" width="16" height="9" rx="2" />
    </>
  ),
  menu: (
    <>
      <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  instalar: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 11v5" />
      <path d="m9.5 13.5 2.5 2.5 2.5-2.5" />
    </>
  ),
};

function PasoInstalacion({
  numero,
  icono,
  children,
}: {
  numero: number;
  icono: keyof typeof iconosPaso;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-espresso text-xs font-bold text-linen">
        {numero}
      </span>
      <span className="flex flex-1 items-start gap-2 pt-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 h-4 w-4 shrink-0 text-camel"
        >
          {iconosPaso[icono]}
        </svg>
        <span className="text-sm leading-relaxed text-cocoa">{children}</span>
      </span>
    </li>
  );
}

export function InstalarApp() {
  const t = useTranslations('Landing');
  const [plataforma, setPlataforma] = useState<Plataforma>('desktop');
  const [promptEvento, setPromptEvento] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [avisoSafari, setAvisoSafari] = useState(false);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    // navigator/window solo existen del lado del cliente — no hay
    // forma de saber la plataforma durante el render en el servidor,
    // así que se detecta al montar. Envuelto en función async (aunque
    // no espera nada) para que los setState no corran síncronos dentro
    // del cuerpo del efecto, mismo patrón que NotificacionesToggle.
    async function detectarAlMontar() {
      setPlataforma(detectarPlataforma());
      setAvisoSafari(abrioDesdeNavegadorSinInstalarEnIOS());
      if (window.matchMedia('(display-mode: standalone)').matches) setInstalada(true);
    }
    detectarAlMontar();

    function alAntesDeInstalar(evento: Event) {
      evento.preventDefault();
      setPromptEvento(evento as EventoInstalar);
    }
    function alInstalar() {
      setInstalada(true);
      setPromptEvento(null);
    }

    window.addEventListener('beforeinstallprompt', alAntesDeInstalar);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', alAntesDeInstalar);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, []);

  async function instalarAhora() {
    if (!promptEvento) return;
    setInstalando(true);
    await promptEvento.prompt();
    await promptEvento.userChoice;
    setPromptEvento(null);
    setInstalando(false);
  }

  const pestanas: { id: Plataforma; etiqueta: string }[] = [
    { id: 'ios', etiqueta: t('instalar.tabIphone') },
    { id: 'android', etiqueta: t('instalar.tabAndroid') },
    { id: 'desktop', etiqueta: t('instalar.tabComputadora') },
  ];

  return (
    <div className="mx-auto w-full max-w-lg text-left">
      <div className="flex gap-2">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlataforma(p.id)}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              plataforma === p.id ? 'border-espresso bg-espresso text-linen' : 'border-camel bg-linen text-cocoa'
            }`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-camel bg-khaki/40 p-5">
        {instalada ? (
          <p className="text-center text-sm font-semibold text-cocoa">✓ {t('instalar.yaInstalada')}</p>
        ) : (
          <>
            {plataforma === 'ios' && avisoSafari && (
              <p className="mb-4 rounded-lg border border-[#c9702f] bg-[#c9702f]/10 px-3 py-2 text-sm font-medium text-[#c9702f]">
                {t('instalar.avisoAbrirEnSafari')}
              </p>
            )}

            {plataforma !== 'ios' && promptEvento && (
              <>
                <button
                  type="button"
                  onClick={instalarAhora}
                  disabled={instalando}
                  className={buttonClasses('primary', 'w-full disabled:opacity-50')}
                >
                  {instalando ? t('instalar.instalando') : t('instalar.botonInstalar')}
                </button>
                <p className="mb-3 mt-3 text-xs font-semibold uppercase tracking-wide text-camel">
                  {t('instalar.oSiNoAparece')}
                </p>
              </>
            )}

            <ol className="space-y-3">
              {plataforma === 'ios' && (
                <>
                  <PasoInstalacion numero={1} icono="compartir">
                    {t('instalar.iosPaso1')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={2} icono="menu">
                    {t('instalar.iosPaso2')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={3} icono="instalar">
                    {t('instalar.iosPaso3')}
                  </PasoInstalacion>
                </>
              )}
              {plataforma === 'android' && (
                <>
                  <PasoInstalacion numero={1} icono="menu">
                    {t('instalar.androidPaso1')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={2} icono="instalar">
                    {t('instalar.androidPaso2')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={3} icono="instalar">
                    {t('instalar.androidPaso3')}
                  </PasoInstalacion>
                </>
              )}
              {plataforma === 'desktop' && (
                <>
                  <PasoInstalacion numero={1} icono="instalar">
                    {t('instalar.desktopPaso1')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={2} icono="instalar">
                    {t('instalar.desktopPaso2')}
                  </PasoInstalacion>
                  <PasoInstalacion numero={3} icono="instalar">
                    {t('instalar.desktopPaso3')}
                  </PasoInstalacion>
                </>
              )}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
