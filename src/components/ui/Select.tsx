import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ label, id, name, className = '', children, ...props }: SelectProps) {
  const selectId = id ?? name;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-semibold text-espresso dark:text-linen">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`min-h-11 w-full rounded-lg border border-khaki bg-linen px-3 text-base text-espresso shadow-sm focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35 dark:border-cocoa dark:bg-[#3a2820] dark:text-linen dark:focus:border-camel ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
