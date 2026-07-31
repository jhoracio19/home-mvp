'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './Button';
import type { ComponentProps } from 'react';

// Botón de submit consciente de useFormStatus: deshabilita y muestra
// estado de carga mientras la Server Action del <form> padre corre.
export function SubmitButton({
  children,
  pendingText = 'Cargando…',
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
