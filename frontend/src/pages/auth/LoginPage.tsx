import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth.schema';
import { useLogin } from '../../hooks/useLogin';
import { useState } from 'react';
import * as lucide from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import type { z } from 'zod';
import type { SubmitHandler } from 'react-hook-form';

export default function LoginPage() {
  const { login } = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<z.infer<typeof loginSchema>> = async (data) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Invalid email or password';
      setServerError(typeof message === 'string' ? message : Array.isArray(message) ? message.join(', ') : 'Invalid email or password');
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
          Sign in to your account
        </h2>
        <p className="text-sm text-aegis-muted mb-8">
          Welcome back. Enter your credentials below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              placeholder="Enter your password"
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

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-aegis-gold focus:ring-aegis-gold border-aegis-border rounded bg-aegis-dark"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-aegis-gold hover:text-aegis-gold-light transition-colors">
                Forgot password?
              </a>
            </div>
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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-aegis-gold hover:text-aegis-gold-light transition-colors">
              Sign up
            </a>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
