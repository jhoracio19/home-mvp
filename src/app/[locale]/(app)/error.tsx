'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorBoundary');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,_#FAF6F1_0%,_#F0E2D4_100%)] px-4 py-8 dark:bg-none dark:bg-espresso">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-khaki bg-linen/95 p-6 text-center shadow-lg dark:border-cocoa dark:bg-espresso-deep">
        <h1 className="text-xl font-bold text-espresso dark:text-linen">{t('titulo')}</h1>
        <p className="text-sm text-cocoa dark:text-khaki">{t('descripcionApp')}</p>
        <Button onClick={() => reset()} className="w-full">
          {t('reintentar')}
        </Button>
      </div>
    </main>
  );
}
