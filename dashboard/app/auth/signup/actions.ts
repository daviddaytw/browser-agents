'use server';

import { createUser, getUserByEmail } from '../../../lib/auth/user-service';
import { signIn } from '../../../auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export async function signUp(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate form data
    const validatedData = signUpSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return {
        error: 'An account with this email already exists.',
        type: 'UserExists',
      };
    }

    // Create new user
    await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Automatically sign in the user after successful registration
    return await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirectTo: '/',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        type: 'ValidationError',
      };
    }

    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        error: 'Failed to sign in after registration.',
        type: error.type,
      };
    }

    console.error('Sign up error:', error);
    return {
      error: 'Something went wrong during registration.',
      type: 'UnknownError',
    };
  }
}
