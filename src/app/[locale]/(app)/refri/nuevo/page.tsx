import { getTranslations } from 'next-intl/server';
import { getMiembrosCasaActiva } from '@/lib/casas/data';
import { getReferenciaCaducidad } from '@/lib/refri/data';
import { crearItem } from '../actions';
import { ItemForm } from '@/components/refri/ItemForm';

export default async function NuevoItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [referencia, miembros, { error }, t] = await Promise.all([
    getReferenciaCaducidad(),
    getMiembrosCasaActiva(),
    searchParams,
    getTranslations('Refri'),
  ]);

  return (
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="h-fit w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg dark:border-cocoa dark:bg-espresso-deep">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('eyebrow')}</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa dark:text-linen">{t('agregarProducto')}</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger dark:text-danger-soft">
            {error}
          </p>
        )}

        <ItemForm referencia={referencia} miembros={miembros} action={crearItem} textoBoton={t('agregarAlRefri')} />
      </div>
    </main>
  );
}
