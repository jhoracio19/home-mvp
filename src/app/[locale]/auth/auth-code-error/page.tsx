import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonClasses } from '@/components/ui/Button';

export default async function AuthCodeErrorPage() {
  const t = await getTranslations('AuthCodeError');
  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(178,150,125,0.32),_transparent_36%)] bg-linen px-4 py-12 dark:bg-none dark:bg-espresso">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-camel bg-khaki p-6 text-center shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <h1 className="text-xl font-bold text-cocoa dark:text-linen">{t('titulo')}</h1>
        <p className="text-sm font-medium text-cocoa dark:text-camel">{t('descripcion')}</p>
        <Link href="/login" className={buttonClasses('primary', 'mt-2')}>
          {t('volverAIniciarSesion')}
        </Link>
      </div>
    </main>
  );
}
