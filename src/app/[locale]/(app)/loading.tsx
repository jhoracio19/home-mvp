import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('Auth');
  return (
    <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,_#FAF6F1_0%,_#F0E2D4_100%)] px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-khaki border-t-espresso dark:border-cocoa dark:border-t-linen" />
        <p className="text-sm font-medium text-cocoa dark:text-khaki">{t('cargando')}</p>
      </div>
    </main>
  );
}
