import { getTranslations } from 'next-intl/server';
import { getUsuarioActual } from '@/lib/casas/data';
import { getPerfilPropio } from '@/lib/perfil/data';
import { actualizarPerfil } from './actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alerta } from '@/components/ui/Alerta';
import { BotonVolver } from '@/components/layout/BotonVolver';

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
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8">
      <div className="h-fit w-full max-w-sm space-y-6">
        <BotonVolver href="/dashboard">{t('volver')}</BotonVolver>

        <div className="space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('cuenta')}</p>
            <h1 className="mt-1 text-xl font-bold text-cocoa">{t('miPerfil')}</h1>
            <p className="mt-1 text-sm text-cocoa/70">{usuario.email}</p>
          </div>

          {message && <Alerta variante="info">{message}</Alerta>}
          {error && <Alerta variante="error">{error}</Alerta>}

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
