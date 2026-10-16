import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel focus-visible:ring-offset-2 focus-visible:ring-offset-linen disabled:opacity-50 disabled:pointer-events-none';

// "sm" es para acciones secundarias dentro de cards/listas; mantiene
// 36px de alto — nunca los ~24px que daban los overrides min-h-0.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-base',
};

const variants: Record<ButtonVariant, string> = {
  // Cocoa en reposo; espresso (el tono de mayor énfasis) aparece al
  // interactuar, como si el botón "se comprometiera" más al presionarlo.
  primary: 'bg-cocoa text-linen shadow-sm hover:bg-espresso active:bg-espresso-deep',
  secondary:
    'border border-camel bg-linen text-cocoa shadow-sm hover:border-espresso hover:bg-khaki active:bg-camel dark:border-cocoa dark:bg-espresso-deep dark:text-linen dark:hover:border-camel dark:hover:bg-cocoa',
  danger: 'bg-danger text-linen shadow-sm hover:bg-danger-hover active:bg-danger-active',
};

// Exportado para que <Link> pueda verse como botón sin anidar
// <button> dentro de <a> (inválido en HTML).
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  className = '',
  size: ButtonSize = 'md',
) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className, size)} {...props} />;
}
