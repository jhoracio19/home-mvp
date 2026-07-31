import Link from 'next/link';
import { login } from '@/app/auth/actions';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.28),_transparent_34%),linear-gradient(180deg,_#F5F1EA_0%,_#D7C9B8_100%)] px-4 py-12 dark:bg-none dark:bg-espresso">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-khaki bg-linen/95 p-6 shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-espresso dark:text-linen">Iniciar sesión</h1>
          <p className="text-sm font-medium text-cocoa dark:text-camel">Gestión doméstica</p>
        </div>

        {message && (
          <p className="rounded-xl border-2 border-camel bg-camel/25 px-3 py-2 text-sm font-medium text-espresso dark:text-linen">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-cocoa bg-khaki/45 px-3 py-2 text-sm font-semibold text-espresso dark:text-linen">
            {error}
          </p>
        )}

        <form action={login} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          <Input label="Correo" name="email" type="email" required autoComplete="email" />
          <PasswordInput label="Contraseña" name="password" required autoComplete="current-password" />
          <SubmitButton className="w-full">Entrar</SubmitButton>
        </form>

        <p className="text-center text-sm text-cocoa dark:text-khaki">
          ¿No tienes cuenta?{' '}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
            className="font-bold text-espresso hover:underline dark:text-camel"
          >
            Crea una
          </Link>
        </p>
      </div>
    </main>
  );
}
