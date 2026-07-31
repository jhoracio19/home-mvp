'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './Button';
import type { ComponentProps, MouseEvent } from 'react';

// Botón de submit consciente de useFormStatus: deshabilita y muestra
// estado de carga mientras la Server Action del <form> padre corre.
// `confirmMessage` opcional agrega un confirm() nativo antes de dejar
// pasar el submit (usado en acciones destructivas como eliminar).
export function SubmitButton({
  children,
  pendingText = 'Cargando…',
  confirmMessage,
  onClick,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();

  function manejarClick(evento: MouseEvent<HTMLButtonElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  }

  return (
    <Button type="submit" disabled={pending} onClick={manejarClick} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
