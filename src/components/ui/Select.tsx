import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  /** Mensaje de error: pinta el borde en danger y se anuncia vía aria. */
  error?: string;
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: string;
};

export function Select({ label, id, name, error, hint, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? name;
  const descripcionId = error || hint ? `${selectId}-descripcion` : undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-semibold text-cocoa dark:text-linen">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcionId}
        className={`min-h-11 w-full rounded-lg border bg-linen px-3 text-base text-cocoa shadow-sm focus:outline-none focus:ring-2 dark:bg-espresso-deep dark:text-linen ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/30'
            : 'border-camel focus:border-espresso focus:ring-camel/35 dark:border-cocoa dark:focus:border-camel'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
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
