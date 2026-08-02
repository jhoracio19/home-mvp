import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { login } from '@/app/[locale]/auth/actions';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { BotonGoogle } from '@/components/auth/BotonGoogle';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const [{ error, message, next }, t] = await Promise.all([searchParams, getTranslations('Auth')]);

  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] px-4 py-12">
        <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-cocoa">{t('iniciarSesion')}</h1>
            <p className="text-sm font-medium text-cocoa/70">{t('entraATuCasa')}</p>
          </div>

          {message && (
            <p className="rounded-xl border-2 border-camel bg-linen px-3 py-2 text-sm font-medium text-cocoa">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
              {error}
            </p>
          )}

          <form action={login} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} />}
            <Input label={t('correo')} name="email" type="email" required autoComplete="email" />
            <PasswordInput label={t('contrasena')} name="password" required autoComplete="current-password" />
            <div className="text-right">
              <Link href="/recuperar" className="text-xs font-semibold text-camel hover:underline">
                {t('olvidasteContrasena')}
              </Link>
            </div>
            <SubmitButton className="w-full">{t('entrar')}</SubmitButton>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-camel/40" />
            <span className="text-xs font-semibold uppercase tracking-wide text-cocoa/60">{t('o')}</span>
            <div className="h-px flex-1 bg-camel/40" />
          </div>

          <BotonGoogle next={next} />

          <p className="text-center text-sm text-cocoa">
            {t('noTienesCuenta')}{' '}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
              className="font-bold text-camel hover:underline"
            >
              {t('creaUna')}
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
