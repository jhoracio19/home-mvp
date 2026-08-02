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
    <main className="flex flex-1 items-center justify-center bg-khaki/40 px-4 py-12 dark:bg-espresso">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-khaki bg-white p-6 text-center shadow-lg dark:border-cocoa dark:bg-[#3a2820]">
        <h1 className="text-xl font-bold text-espresso dark:text-linen">{t('titulo')}</h1>
        <p className="text-sm text-cocoa dark:text-khaki">{t('descripcionGenerica')}</p>
        <Button onClick={() => reset()} className="w-full">
          {t('reintentar')}
        </Button>
      </div>
    </main>
  );
}
