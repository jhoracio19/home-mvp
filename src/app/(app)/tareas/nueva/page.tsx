import { getMiembrosCasaActiva } from '@/lib/casas/data';
import { crearTarea } from '../actions';
import { TareaForm } from '@/components/tareas/TareaForm';

export default async function NuevaTareaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [miembros, { error }] = await Promise.all([getMiembrosCasaActiva(), searchParams]);

  return (
    <main className="flex flex-1 justify-center bg-[radial-gradient(circle_at_top_left,_rgba(178,150,125,0.3),_transparent_34%)] bg-linen px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="h-fit w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-camel">Tareas</p>
          <h1 className="mt-1 text-xl font-bold text-cocoa dark:text-linen">Nueva tarea</h1>
        </div>

        {error && (
          <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e] dark:text-[#e3a999]">
            {error}
          </p>
        )}

        <TareaForm miembros={miembros} action={crearTarea} textoBoton="Crear tarea" />
      </div>
    </main>
  );
}
