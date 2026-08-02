import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const CORREO_CONTACTO = 'jhoracio19@hotmail.com';

export default async function PrivacidadPage() {
  const t = await getTranslations('Privacidad');
  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      <main className="flex-1 px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">{t('legal')}</p>
            <h1 className="mt-1 text-2xl font-bold text-espresso sm:text-3xl">{t('titulo')}</h1>
            <p className="mt-2 text-sm text-cocoa/70">{t('intro')}</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">{t('queGuardamosTitulo')}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-cocoa">
              <li>{t('queGuardamos1')}</li>
              <li>
                {t('queGuardamos2Pre')} <strong>{t('queGuardamos2Boton')}</strong>
                {t('queGuardamos2Post')}
              </li>
              <li>{t('queGuardamos3')}</li>
              <li>{t('queGuardamos4')}</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">{t('paraQueTitulo')}</h2>
            <p className="text-sm text-cocoa">{t('paraQueTexto')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">{t('conQuienTitulo')}</h2>
            <p className="text-sm text-cocoa">{t('conQuienIntro')}</p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-cocoa">
              <li><strong>Supabase</strong> — {t('conQuienSupabaseDesc')}</li>
              <li><strong>Google</strong> — {t('conQuienGoogleDesc')}</li>
              <li><strong>Resend</strong> — {t('conQuienResendDesc')}</li>
              <li><strong>Vercel</strong> — {t('conQuienVercelDesc')}</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">{t('borrarTitulo')}</h2>
            <p className="text-sm text-cocoa">
              {t('borrarPre')} <span className="font-semibold">{t('borrarBoton')}</span>
              {t('borrarPost')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">{t('contactoTitulo')}</h2>
            <p className="text-sm text-cocoa">
              {t('contactoTexto')}{' '}
              <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold text-camel hover:underline">
                {CORREO_CONTACTO}
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
