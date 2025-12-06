import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`
          w-full px-4 py-2
          ${icon ? 'pl-10' : ''}
          bg-white dark:bg-dark-card
          border border-gray-300 dark:border-dark-border
          rounded-lg
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600
          transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
