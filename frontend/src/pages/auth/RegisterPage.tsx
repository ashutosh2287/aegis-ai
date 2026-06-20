import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../schemas/auth.schema';
import { useRegister } from '../../hooks/useRegister';
import { useState } from 'react';
import * as lucide from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { PasswordStrengthBar } from '../../components/ui/PasswordStrengthBar';
import type { z } from 'zod';
import type { SubmitHandler } from 'react-hook-form';

export default function RegisterPage() {
  const { register: registerUser } = useRegister(); // renamed to avoid conflict with form register
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  // Watch the password field to pass to the strength bar
  const password = useWatch({ name: 'password' });

  const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (data) => {
    setServerError(null);
    try {
      await registerUser(
        data.firstName,
        data.lastName,
        data.email,
        data.password
      );
      // on successful registration, the hook navigates to dashboard
    } catch {
      setServerError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-center text-2xl font-bold">Create your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                className={`
                  block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900
                  shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                  ${errors.firstName ? 'ring-red-300' : ''}
                `}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                className={`
                  block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900
                  shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                  ${errors.lastName ? 'ring-red-300' : ''}
                `}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`
                block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900
                shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                ${errors.email ? 'ring-red-300' : ''}
              `}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type={passwordVisible ? 'text' : 'password'}
              {...register('password')}
              className={`
                block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900
                shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                ${errors.password ? 'ring-red-300' : ''}
              `}
            />
            <button
              type="button"
              className={`
                absolute inset-y-0 right-0 flex items-center pr-3
              `}
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? (
                <lucide.EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <lucide.Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={confirmPasswordVisible ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`
                block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900
                shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                ${errors.confirmPassword ? 'ring-red-300' : ''}
              `}
            />
            <button
              type="button"
              className={`
                absolute inset-y-0 right-0 flex items-center pr-3
              `}
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? (
                <lucide.EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <lucide.Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Strength Bar */}
          <div className="mt-4">
            <PasswordStrengthBar password={password} />
          </div>

          {serverError && (
            <p className="mt-1 text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="register-newsletter"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="register-newsletter" className="ml-2 block text-sm text-gray-900">
                Subscribe to newsletter
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-flex items-center justify-center px-4 py-2
              border border-transparent rounded-md shadow-sm
              text-sm font-medium text-white
              bg-indigo-600 hover:bg-indigo-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}