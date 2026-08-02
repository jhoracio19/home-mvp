import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { actualizarContrasena } from '@/app/[locale]/auth/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, t, locale] = await Promise.all([
    searchParams,
    getTranslations('Auth'),
    getLocale() as Promise<Locale>,
  ]);

  // Se llega aquí con una sesión activa: o la de recuperación (recién
  // canjeada en /auth/callback tras abrir el link del correo), o una
  // sesión normal si alguien ya logueado decide cambiar su contraseña.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: `/login?next=${encodeURIComponent('/restablecer')}`, locale });
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] bg-linen px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-cocoa">{t('elegirNuevaContrasena')}</h1>
          <p className="text-sm font-medium text-cocoa">{user.email}</p>
        </div>

        {error && (
          <p className="rounded-lg border border-cocoa bg-linen px-3 py-2 text-sm font-semibold text-cocoa">
            {error}
          </p>
        )}

        <form action={actualizarContrasena} className="space-y-4">
          <PasswordInput
            label={t('contrasenaNueva')}
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <PasswordInput
            label={t('confirmarContrasena')}
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <SubmitButton className="w-full">{t('guardarContrasena')}</SubmitButton>
        </form>
      </div>
    </main>
  );
}
