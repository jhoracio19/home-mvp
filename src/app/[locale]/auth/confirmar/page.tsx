import { getTranslations } from 'next-intl/server';
import { confirmarCuenta } from '@/app/[locale]/auth/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string; error?: string }>;
}) {
  const [{ token_hash, type, next, error }, t] = await Promise.all([searchParams, getTranslations('Auth')]);
  const linkValido = Boolean(token_hash && type);
  const esRecuperacion = type === 'recovery';

  const titulo = esRecuperacion ? t('restablecerTitulo') : t('confirmarCuentaTitulo');
  const explicacion = esRecuperacion ? t('explicacionRecuperacion') : t('explicacionConfirmacion');
  const textoBoton = esRecuperacion ? t('continuar') : t('confirmarCuentaBoton');

  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 text-center shadow-lg">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-cocoa">{titulo}</h1>
            <p className="text-sm text-cocoa/70">{explicacion}</p>
          </div>

          {error && (
            <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
              {error}
            </p>
          )}

          {linkValido ? (
            <form action={confirmarCuenta}>
              <input type="hidden" name="token_hash" value={token_hash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next ?? '/casas'} />
              <SubmitButton className="w-full" pendingText={t('cargando')}>
                {textoBoton}
              </SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-cocoa/70">{t('linkNoValidoExplicacion')}</p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
