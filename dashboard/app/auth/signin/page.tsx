
'use client';

import { SignInPage } from '@toolpad/core/SignInPage';
import { providerMap } from '../../../auth';
import signIn from './actions';
import type { AuthProvider } from '@toolpad/core';

export default function SignIn() {
  const handleSignIn = async (provider: AuthProvider, formData: FormData, callbackUrl?: string) => {
    return await signIn(provider, formData, callbackUrl);
  };

  return (
    <SignInPage
      signIn={handleSignIn}
      providers={providerMap}
    />
  );
}
