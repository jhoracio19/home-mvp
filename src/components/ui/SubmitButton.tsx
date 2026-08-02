'use client';

import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import type { ComponentProps, MouseEvent } from 'react';

// Botón de submit consciente de useFormStatus: deshabilita y muestra
// estado de carga mientras la Server Action del <form> padre corre.
// `confirmMessage` opcional agrega un confirm() nativo antes de dejar
// pasar el submit (usado en acciones destructivas como eliminar).
export function SubmitButton({
  children,
  pendingText,
  confirmMessage,
  onClick,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations('Common');

  function manejarClick(evento: MouseEvent<HTMLButtonElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  }

  return (
    <Button type="submit" disabled={pending} onClick={manejarClick} {...props}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2Z" />
          </svg>
          {pendingText ?? t('cargando')}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
