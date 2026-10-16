import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMiembrosCasaActiva } from '@/lib/casas/data';
import { getItemRefri, getReferenciaCaducidad } from '@/lib/refri/data';
import { actualizarItem } from '../../actions';
import { ItemForm } from '@/components/refri/ItemForm';

export default async function EditarItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const [item, referencia, miembros, { error }, t] = await Promise.all([
    getItemRefri(id),
    getReferenciaCaducidad(),
    getMiembrosCasaActiva(),
    searchParams,
    getTranslations('Refri'),
  ]);

  if (!item) notFound();

  return (
    <main className="flex flex-1 justify-center fondo-pagina px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="h-fit w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg dark:border-cocoa dark:bg-espresso-deep">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">{t('eyebrow')}</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa dark:text-linen">{t('editarProducto', { nombre: item.nombre })}</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger dark:text-danger-soft">
            {error}
          </p>
        )}

        <ItemForm
          referencia={referencia}
          miembros={miembros}
          itemInicial={item}
          action={actualizarItem.bind(null, item.id)}
          textoBoton={t('guardarCambios')}
        />
      </div>
    </main>
  );
}
