import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getUsuarioActual } from '@/lib/casas/data';
import { getPerfilPropio } from '@/lib/perfil/data';
import { actualizarPerfil } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [usuario, perfil, { error, message }, t] = await Promise.all([
    getUsuarioActual(),
    getPerfilPropio(),
    searchParams,
    getTranslations('Perfil'),
  ]);

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8">
      <div className="h-fit w-full max-w-sm space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa hover:underline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('volver')}
        </Link>

        <div className="space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('cuenta')}</p>
            <h1 className="mt-1 text-xl font-bold text-cocoa">{t('miPerfil')}</h1>
            <p className="mt-1 text-sm text-cocoa/70">{usuario.email}</p>
          </div>

          {message && (
            <p className="rounded-lg border-2 border-camel bg-linen px-3 py-2 text-sm font-semibold text-cocoa">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
              {error}
            </p>
          )}

          <form action={actualizarPerfil} className="space-y-4">
            <Input
              label={t('nickname')}
              name="nombre"
              placeholder={t('nicknamePlaceholder')}
              defaultValue={perfil?.nombre ?? ''}
              required
              maxLength={60}
              autoComplete="nickname"
            />
            <SubmitButton className="w-full">{t('guardarCambios')}</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
