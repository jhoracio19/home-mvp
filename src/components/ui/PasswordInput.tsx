'use client';

import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function PasswordInput({ label, id, name, className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-semibold text-cocoa dark:text-linen">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`min-h-11 w-full rounded-lg border border-camel bg-linen px-3 pr-11 text-base text-cocoa shadow-sm focus:border-espresso focus:outline-none focus:ring-2 focus:ring-camel/35 dark:border-cocoa dark:bg-[#3a2820] dark:text-linen dark:focus:border-camel ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-cocoa hover:text-espresso dark:text-khaki dark:hover:text-linen"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M1 12s4-7 11-7c2 0 3.7.6 5.1 1.4M23 12s-4 7-11 7c-2 0-3.7-.6-5.1-1.4" />
              <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
