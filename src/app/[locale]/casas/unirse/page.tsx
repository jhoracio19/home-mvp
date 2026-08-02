import { getLocale, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { unirseConCodigo } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { buttonClasses } from '@/components/ui/Button';

function rutaActual(codigo?: string) {
  return codigo ? `/casas/unirse?codigo=${encodeURIComponent(codigo)}` : '/casas/unirse';
}

export default async function UnirseCasaPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; error?: string }>;
}) {
  const { codigo: codigoRaw, error } = await searchParams;
  const codigo = codigoRaw?.trim().toUpperCase();
  const t = await getTranslations('UnirseCasa');
  const locale = (await getLocale()) as Locale;

  // No usamos getSesion() (que redirige a /login sin recordar a dónde
  // ibas): aquí necesitamos volver exactamente a esta invitación
  // después de iniciar sesión.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: `/login?next=${encodeURIComponent(rutaActual(codigo))}`, locale });
  }

  let invitacion: { casa_id: string; nombre: string } | null = null;
  if (codigo) {
    const { data } = await supabase.rpc('previsualizar_invitacion', { p_codigo: codigo });
    invitacion = data?.[0] ?? null;
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] bg-linen px-4 py-12 dark:bg-none dark:bg-espresso">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-cocoa dark:text-linen">{t('titulo')}</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-cocoa bg-linen px-3 py-2 text-sm font-semibold text-cocoa dark:text-linen">
            {error}
          </p>
        )}

        {codigo && !invitacion && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e] dark:text-[#e3a999]">
            {t('codigoInvalido')}
          </p>
        )}

        {invitacion ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-cocoa dark:text-khaki">{t('teInvitaron')}</p>
            <p className="text-xl font-bold text-espresso dark:text-linen">{invitacion.nombre}</p>
            <form action={unirseConCodigo.bind(null, codigo!)}>
              <SubmitButton className="w-full" pendingText={t('uniendome')}>
                {t('unirmeAEstaCasa')}
              </SubmitButton>
            </form>
          </div>
        ) : (
          <form action={`/${locale}/casas/unirse`} className="space-y-4">
            <Input
              label={t('codigoDeInvitacion')}
              name="codigo"
              placeholder={t('ejemploCodigo')}
              defaultValue={codigo ?? ''}
              className="text-center font-mono uppercase tracking-widest"
              required
            />
            <button type="submit" className={buttonClasses('primary', 'w-full')}>
              {t('buscar')}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-cocoa dark:text-khaki">
          <Link href="/dashboard" className="font-bold text-camel hover:underline">
            {t('volver')}
          </Link>
        </p>
      </div>
    </main>
  );
}
