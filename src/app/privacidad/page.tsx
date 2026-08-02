import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const CORREO_CONTACTO = 'jhoracio19@hotmail.com';

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-linen">
      <SiteHeader />

      <main className="flex-1 px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-camel">Legal</p>
            <h1 className="mt-1 text-2xl font-bold text-espresso sm:text-3xl">Aviso de privacidad</h1>
            <p className="mt-2 text-sm text-cocoa/70">
              RemindHome es un proyecto pequeño hecho para organizar el refri y las tareas de tu casa. Este
              aviso explica, en español sencillo, qué datos guardamos y para qué.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">Qué información guardamos</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-cocoa">
              <li>Tu correo, nombre y apellido, y tu contraseña (guardada cifrada, nunca en texto plano).</li>
              <li>
                Si entras con <strong>&ldquo;Continuar con Google&rdquo;</strong>, en vez de pedirte que escribas
                nombre/correo/contraseña, los recibimos directo de Google (tu nombre, correo y foto de perfil).
                No le compartimos nada tuyo a Google que Google no supiera ya.
              </li>
              <li>Lo que tú agregues: nombres de casas, integrantes, productos del refri, tareas, gastos y notas.</li>
              <li>
                Si activas notificaciones, la información técnica necesaria para mandarte avisos push a ese
                dispositivo.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">Para qué la usamos</h2>
            <p className="text-sm text-cocoa">
              Únicamente para que la app funcione: mostrarte tu refri y tus tareas, mandarte el correo de
              confirmación o recuperación de contraseña, y avisarte cuando algo vence o te asignan algo. No
              vendemos ni compartimos tu información con nadie para publicidad.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">Con quién la compartimos</h2>
            <p className="text-sm text-cocoa">
              Con los proveedores que hacen posible que la app exista, y solo para eso:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-cocoa">
              <li><strong>Supabase</strong> — guarda la base de datos y maneja el inicio de sesión.</li>
              <li><strong>Google</strong> — solo si eliges &ldquo;Continuar con Google&rdquo;, para confirmar que eres tú.</li>
              <li><strong>Resend</strong> — manda los correos de confirmación y recuperación de contraseña.</li>
              <li><strong>Vercel</strong> — aloja la app y nos da estadísticas anónimas de visitas (no identifican a ninguna persona).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">Cómo borrar tu cuenta o tus datos</h2>
            <p className="text-sm text-cocoa">
              Puedes eliminar una casa completa (y todo lo que tenga dentro) tú mismo desde{' '}
              <span className="font-semibold">Configuración de la casa</span>, si eres admin. Si quieres que
              borremos tu cuenta y tu información por completo, escríbenos y lo hacemos manualmente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-cocoa">Contacto</h2>
            <p className="text-sm text-cocoa">
              Dudas, solicitudes sobre tus datos, o cualquier cosa: escríbenos a{' '}
              <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold text-camel hover:underline">
                {CORREO_CONTACTO}
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
