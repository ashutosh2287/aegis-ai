import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../schemas/auth.schema';
import { useRegister } from '../../hooks/useRegister';
import { useState } from 'react';
import * as lucide from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordStrengthBar } from '../../components/ui/PasswordStrengthBar';
import type { z } from 'zod';
import type { SubmitHandler } from 'react-hook-form';

export default function RegisterPage() {
  const { register: registerUser } = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = useWatch({ name: 'password', control });

  const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (data) => {
    setServerError(null);
    try {
      await registerUser(data.firstName, data.lastName, data.email, data.password);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setServerError(typeof message === 'string' ? message : Array.isArray(message) ? message.join(', ') : 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          Create your account
        </h2>
        <p className="text-sm text-aegis-muted mb-8">
          Start your fitness journey with AI-powered coaching.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              id="firstName"
              label="First name"
              type="text"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <AuthInput
              id="lastName"
              label="Last name"
              type="text"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <AuthInput
              id="password"
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Create a strong password"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pt-7"
              onClick={() => setPasswordVisible(!passwordVisible)}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            >
              {passwordVisible ? (
                <lucide.EyeOff className="h-4 w-4 text-aegis-muted" />
              ) : (
                <lucide.Eye className="h-4 w-4 text-aegis-muted" />
              )}
            </button>
          </div>

          <div className="relative">
            <AuthInput
              id="confirmPassword"
              label="Confirm password"
              type={confirmPasswordVisible ? 'text' : 'password'}
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pt-7"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              aria-label={confirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
            >
              {confirmPasswordVisible ? (
                <lucide.EyeOff className="h-4 w-4 text-aegis-muted" />
              ) : (
                <lucide.Eye className="h-4 w-4 text-aegis-muted" />
              )}
            </button>
          </div>

          <PasswordStrengthBar password={password} />

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <div className="flex items-center">
            <input
              id="register-newsletter"
              type="checkbox"
              className="h-4 w-4 text-aegis-gold focus:ring-aegis-gold border-aegis-border rounded bg-aegis-dark"
            />
            <label htmlFor="register-newsletter" className="ml-2 block text-sm text-gray-400">
              Subscribe to newsletter
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full flex items-center justify-center px-4 py-2.5
              border border-aegis-gold/30 rounded-lg
              text-sm font-semibold text-aegis-black
              bg-aegis-gold hover:bg-aegis-gold-light
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aegis-black focus:ring-aegis-gold
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[0_0_20px_rgba(212,168,67,0.15)] hover:shadow-[0_0_30px_rgba(212,168,67,0.25)]
            "
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-aegis-gold hover:text-aegis-gold-light transition-colors">
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
