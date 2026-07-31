import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-base font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  // Cocoa en reposo; espresso (el tono de mayor énfasis) aparece al
  // interactuar, como si el botón "se comprometiera" más al presionarlo.
  primary: 'bg-cocoa text-linen shadow-sm hover:bg-espresso active:bg-[#3a2820]',
  secondary:
    'border border-camel bg-linen text-cocoa shadow-sm hover:border-espresso hover:bg-khaki active:bg-camel dark:border-cocoa dark:bg-[#3a2820] dark:text-linen dark:hover:border-camel dark:hover:bg-cocoa',
  danger: 'bg-[#a8422e] text-linen shadow-sm hover:bg-[#8f3626] active:bg-[#7a2d20]',
};

// Exportado para que <Link> pueda verse como botón sin anidar
// <button> dentro de <a> (inválido en HTML).
export function buttonClasses(variant: ButtonVariant = 'primary', className = '') {
  return `${base} ${variants[variant]} ${className}`;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
