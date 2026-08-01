import Link from 'next/link';
import { signup } from '@/app/auth/actions';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] px-4 py-12">
        <div className="w-full max-w-sm space-y-6 rounded-lg border border-camel bg-khaki p-6 shadow-lg">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-cocoa">Crear cuenta</h1>
            <p className="text-sm font-medium text-cocoa/70">Organiza el refri y las tareas de tu casa</p>
          </div>

          {error && (
            <p className="rounded-lg border border-[#a8422e] bg-[#a8422e]/10 px-3 py-2 text-sm font-medium text-[#a8422e]">
              {error}
            </p>
          )}

          <form action={signup} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} />}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" name="nombre" required maxLength={60} autoComplete="given-name" />
              <Input label="Apellido" name="apellido" required maxLength={60} autoComplete="family-name" />
            </div>
            <Input label="Correo" name="email" type="email" required autoComplete="email" />
            <PasswordInput
              label="Contraseña"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirmar contraseña"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <SubmitButton className="w-full">Crear cuenta</SubmitButton>
          </form>

          <p className="text-center text-sm text-cocoa">
            ¿Ya tienes cuenta?{' '}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
              className="font-bold text-camel hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
