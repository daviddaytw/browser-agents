'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  Stack,
  Container,
  Paper,
} from '@mui/material';
import { signUp } from './actions';
import NextLink from 'next/link';

export default function SignUp() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        const result = await signUp(form);
        if (result?.error) {
          setError(result.error);
        }
      } catch (error) {
        console.error('Sign up error:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
            Sign up
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create your account to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                name="name"
                label="Full Name"
                type="text"
                required
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                disabled={isPending}
                autoComplete="name"
              />

              <TextField
                name="email"
                label="Email"
                type="email"
                required
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                disabled={isPending}
                autoComplete="email"
              />

              <TextField
                name="password"
                label="Password"
                type="password"
                required
                fullWidth
                value={formData.password}
                onChange={handleInputChange}
                disabled={isPending}
                autoComplete="new-password"
                helperText="Must be at least 6 characters"
              />

              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                required
                fullWidth
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isPending}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isPending}
                sx={{ mt: 3, mb: 2 }}
              >
                {isPending ? 'Creating Account...' : 'Sign up'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{' '}
            <Link component={NextLink} href="/auth/signin" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
