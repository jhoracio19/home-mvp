import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
};

export function Select({ label, id, name, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? name;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-semibold text-cocoa dark:text-linen">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`min-h-11 w-full rounded-lg border border-camel bg-linen px-3 text-base text-cocoa shadow-sm focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35 dark:border-cocoa dark:bg-[#3a2820] dark:text-linen dark:focus:border-camel ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
