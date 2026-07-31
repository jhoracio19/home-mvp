import Link from 'next/link';
import { solicitarRecuperacion } from '@/app/auth/actions';
import { Input } from '@/components/ui/Input';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] bg-linen px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-cocoa">Recuperar contraseña</h1>
          <p className="text-sm font-medium text-cocoa">
            Te mandamos un link a tu correo para elegir una nueva.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-cocoa bg-linen px-3 py-2 text-sm font-semibold text-cocoa">
            {error}
          </p>
        )}

        <form action={solicitarRecuperacion} className="space-y-4">
          <Input label="Correo" name="email" type="email" required autoComplete="email" />
          <SubmitButton className="w-full" pendingText="Enviando…">
            Enviar link de recuperación
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-cocoa">
          <Link href="/login" className="font-bold text-camel hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
