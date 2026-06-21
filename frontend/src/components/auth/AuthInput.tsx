import { forwardRef } from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-gray-300">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border-0 py-2.5 pl-3 pr-10
            bg-aegis-dark text-white text-sm leading-6
            ring-1 ring-inset ring-aegis-border
            placeholder:text-aegis-muted
            focus:ring-2 focus:ring-inset focus:ring-aegis-gold
            transition-colors duration-200
            ${error ? 'ring-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
