import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, name, className = '', ...props }: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-semibold text-cocoa dark:text-linen">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`min-h-11 w-full rounded-lg border border-camel bg-linen px-3 text-base text-cocoa shadow-sm placeholder:text-cocoa/50 focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35 dark:border-cocoa dark:bg-[#3a2820] dark:text-linen dark:placeholder:text-khaki/60 dark:focus:border-camel ${className}`}
        {...props}
      />
    </div>
  );
}
