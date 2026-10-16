'use client';

import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Spinner } from './Spinner';
import type { ComponentProps, MouseEvent } from 'react';

// Botón de submit consciente de useFormStatus: deshabilita y muestra
// estado de carga mientras la Server Action del <form> padre corre.
// `confirmMessage` opcional intercepta el submit y pide confirmación
// en un <dialog> propio (antes era un window.confirm() nativo).
export function SubmitButton({
  children,
  pendingText,
  confirmMessage,
  onClick,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations('Common');
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);

  function manejarClick(evento: MouseEvent<HTMLButtonElement>) {
    if (confirmMessage) {
      evento.preventDefault();
      formRef.current = evento.currentTarget.form;
      botonRef.current = evento.currentTarget;
      setConfirmando(true);
      return;
    }
    onClick?.(evento);
  }

  function confirmar() {
    setConfirmando(false);
    // requestSubmit (y no click()) para no volver a pasar por manejarClick.
    formRef.current?.requestSubmit(botonRef.current ?? undefined);
  }

  return (
    <>
      <Button type="submit" disabled={pending} onClick={manejarClick} {...props}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            {pendingText ?? t('cargando')}
          </span>
        ) : (
          children
        )}
      </Button>
      {confirmMessage && (
        <ConfirmDialog
          abierto={confirmando}
          mensaje={confirmMessage}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
