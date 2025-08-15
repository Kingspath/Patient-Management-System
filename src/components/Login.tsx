import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import * as Sentry from '@sentry/react';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { login, loading, databaseReady } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>({
    mode: 'onSubmit', // Only validate on submit to avoid premature errors
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!databaseReady) {
      setError('The application is still initializing. Please wait a moment and try again.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      
      // Validate form data
      if (!data.email?.trim()) {
        setError('Please enter your email address');
        return;
      }
      
      if (!data.password?.trim()) {
        setError('Please enter your password');
        return;
      }
      
      console.log('Submitting login form with:', { email: data.email, passwordLength: data.password.length });
      await login(data.email.trim(), data.password);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Provide user-friendly error messages
      if (err.code === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('User not found')) {
        setError('No account found with this email. Please register first or check your email address.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill function for demo credentials
  const fillDemoCredentials = (type: 'patient' | 'admin') => {
    const credentials = {
      patient: { email: 'patient@carenow.com', password: 'password123' },
      admin: { email: 'admin@carenow.com', password: 'password123' }
    };
    
    reset(credentials[type]);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <img src="/carenow_logo.png" alt="CareNow" className="h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Initializing CareNow...</p>
          {!databaseReady && (
            <p className="text-sm text-gray-500 mt-2">Setting up database and sample data...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/carenow_logo.png" 
            alt="CareNow" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to CareNow</h1>
          <p className="text-gray-600 mt-2">Your trusted healthcare appointment partner</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {!databaseReady && (
              <Alert className="mb-4">
                <AlertDescription>
                  The application is initializing. Please wait a moment before signing in.
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" required>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading || !databaseReady}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" required>Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading || !databaseReady}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !databaseReady}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={isLoading}
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Demo Accounts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <p><strong>Patient:</strong> patient@carenow.com</p>
                <p className="text-xs text-blue-600">Password: password123</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('patient')}
                disabled={isLoading || !databaseReady}
                className="text-xs"
              >
                Fill
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <p><strong>Admin:</strong> admin@carenow.com</p>
                <p className="text-xs text-blue-600">Password: password123</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fillDemoCredentials('admin')}
                disabled={isLoading || !databaseReady}
                className="text-xs"
              >
                Fill
              </Button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-blue-700">
            <p><strong>Note:</strong> If demo accounts don't exist, please register using these credentials first.</p>
          </div>
        </div>
      </div>
    </div>
  );
}