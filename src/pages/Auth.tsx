import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SignUpForm } from '@/components/auth/signup-form';
import { useAuth } from '@/components/auth/auth-provider';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { user, login, signUp } = useAuth();

  // Redirecionar se já estiver logado
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoginMode ? (
          <LoginForm
            onLogin={login}
            onSignUpToggle={() => setIsLoginMode(false)}
          />
        ) : (
          <SignUpForm
            onSignUp={signUp}
            onLoginToggle={() => setIsLoginMode(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;