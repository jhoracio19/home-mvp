import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  /** Mensaje de error: pinta el borde en danger y se anuncia vía aria. */
  error?: string;
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: string;
};

export function Textarea({ label, id, name, error, hint, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? name;
  const descripcionId = error || hint ? `${textareaId}-descripcion` : undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={textareaId} className="block text-sm font-semibold text-cocoa dark:text-linen">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcionId}
        className={`w-full rounded-lg border bg-linen p-3 text-base text-cocoa shadow-sm placeholder:text-cocoa/50 focus:outline-none focus:ring-2 dark:bg-espresso-deep dark:text-linen dark:placeholder:text-khaki/60 ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/30'
            : 'border-camel focus:border-espresso focus:ring-camel/35 dark:border-cocoa dark:focus:border-camel'
        } ${className}`}
        {...props}
      />
      {(error || hint) && (
        <p
          id={descripcionId}
          className={`text-xs ${error ? 'font-semibold text-danger' : 'text-cocoa/70 dark:text-khaki/70'}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
