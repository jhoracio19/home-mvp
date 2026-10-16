'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

// Reemplazo estilizado de window.confirm() para acciones destructivas.
// <dialog> nativo: trae foco atrapado, Escape para cerrar y ::backdrop.
export function ConfirmDialog({
  abierto,
  mensaje,
  onConfirmar,
  onCancelar,
  textoConfirmar,
}: {
  abierto: boolean;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useTranslations('Common');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancelar}
      className="m-auto w-[min(92vw,22rem)] rounded-xl border-2 border-camel bg-linen p-5 text-cocoa shadow-xl backdrop:bg-espresso-deep/50 dark:bg-espresso-deep dark:text-linen"
    >
      <p className="text-sm font-semibold">{mensaje}</p>
      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancelar}>
          {t('cancelar')}
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={onConfirmar}>
          {textoConfirmar ?? t('confirmar')}
        </Button>
      </div>
    </dialog>
  );
}
