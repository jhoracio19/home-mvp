import { notFound } from 'next/navigation';
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
  const [item, referencia, { error }] = await Promise.all([
    getItemRefri(id),
    getReferenciaCaducidad(),
    searchParams,
  ]);

  if (!item) notFound();

  return (
    <main className="flex flex-1 justify-center bg-[linear-gradient(180deg,_#F5F1EA_0%,_#D7C9B8_100%)] px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="h-fit w-full max-w-sm space-y-6 rounded-lg border border-khaki bg-linen/95 p-6 shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Refri</p>
          <h1 className="mt-1 text-xl font-bold text-espresso dark:text-linen">Editar {item.nombre}</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e] dark:text-[#e3a999]">
            {error}
          </p>
        )}

        <ItemForm
          referencia={referencia}
          itemInicial={item}
          action={actualizarItem.bind(null, item.id)}
          textoBoton="Guardar cambios"
        />
      </div>
    </main>
  );
}
