import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password must be less than 72 characters');

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInPasswordInput = z.infer<typeof signInPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function getFirstErrorMessage(result: unknown, field: string): string | undefined {
  const parseResult = result as {
    success: boolean;
    error?: { issues: { path: PropertyKey[]; message: string }[] };
  };
  if (!parseResult.success && parseResult.error) {
    const fieldError = parseResult.error.issues.find((issue) => issue.path.includes(field));
    return fieldError?.message;
  }
  return undefined;
}

export { getFirstErrorMessage };
