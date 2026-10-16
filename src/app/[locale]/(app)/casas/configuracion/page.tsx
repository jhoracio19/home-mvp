import { getTranslations } from 'next-intl/server';
import { getCasaActivaOrRedirect, getRolEnCasaActiva } from '@/lib/casas/data';
import { renombrarCasa, eliminarCasa } from '../actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alerta } from '@/components/ui/Alerta';
import { BotonVolver } from '@/components/layout/BotonVolver';

export default async function ConfiguracionCasaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [casa, rol, { error, message }, t] = await Promise.all([
    getCasaActivaOrRedirect(),
    getRolEnCasaActiva(),
    searchParams,
    getTranslations('Casas'),
  ]);

  const esAdmin = rol === 'admin';

  return (
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8">
      <div className="h-fit w-full max-w-sm space-y-6">
        <BotonVolver href="/dashboard">{t('volver')}</BotonVolver>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{casa.nombre}</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa">{t('configuracionTitulo')}</h1>
        </div>

        {message && <Alerta variante="info">{message}</Alerta>}
        {error && <Alerta variante="error">{error}</Alerta>}

        {!esAdmin ? (
          <div className="space-y-4 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
            <p className="text-sm font-medium text-cocoa">{t('soloAdminEditar')}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
              <h2 className="text-sm font-bold text-cocoa">{t('nombreDeLaCasa')}</h2>
              <form action={renombrarCasa} className="space-y-3">
                <Input label={t('nombre')} name="nombre" defaultValue={casa.nombre} required maxLength={80} />
                <SubmitButton className="w-full">{t('guardarCambios')}</SubmitButton>
              </form>
            </div>

            <div className="space-y-3 rounded-lg border-2 border-danger/40 bg-danger/5 p-6 shadow-lg">
              <h2 className="text-sm font-bold text-danger">{t('zonaDePeligro')}</h2>
              <p className="text-sm text-cocoa">{t('eliminarCasaDescripcion')}</p>
              <form action={eliminarCasa}>
                <SubmitButton
                  variant="danger"
                  className="w-full"
                  pendingText={t('eliminando')}
                  confirmMessage={t('confirmarEliminarCasa', { nombre: casa.nombre })}
                >
                  {t('eliminarEstaCasa')}
                </SubmitButton>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
