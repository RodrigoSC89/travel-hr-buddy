import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Ship, 
  Lock, 
  Mail, 
  User,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

const resetSchema = z.object({
  email: z.string().email('Email inválido')
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const Auth: React.FC = () => {
  const { user, signIn, signUp, resetPassword, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    }
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: ''
    }
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Ship className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  NAUTILUS
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Sistema Corporativo Marítimo
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Gestão Marítima Completa
            </h2>
            <div className="space-y-4">
              {[
                'Controle de frota em tempo real',
                'Gestão de tripulação e certificações',
                'Analytics avançados e relatórios',
                'Automação de processos marítimos'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-border bg-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {activeTab === 'signin' ? 'Entrar na Conta' : 
                 activeTab === 'signup' ? 'Criar Conta' : 
                 'Recuperar Senha'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {activeTab === 'signin' ? 'Entre com suas credenciais para acessar o sistema' :
                 activeTab === 'signup' ? 'Crie sua conta para começar a usar o sistema' :
                 'Digite seu email para receber as instruções'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="signin"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          {...signInForm.register('email')}
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{signInForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          className="pl-10 pr-10"
                          {...signInForm.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{signInForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || authLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="text-center">
                    <Button
                      variant="link"
                      className="text-sm text-muted-foreground"
                      onClick={() => setActiveTab('reset')}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10"
                          {...signUpForm.register('fullName')}
                        />
                      </div>
                      {signUpForm.formState.errors.fullName && (
                        <p className="text-sm text-red-500">{signUpForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          {...signUpForm.register('email')}
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{signUpForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          className="pl-10 pr-10"
                          {...signUpForm.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{signUpForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirme sua senha"
                          className="pl-10"
                          {...signUpForm.register('confirmPassword')}
                        />
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{signUpForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || authLoading}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar Conta'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                {/* Reset Password Tab */}
                {activeTab === 'reset' && (
                  <div className="space-y-4">
                    <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...resetForm.register('email')}
                          />
                        </div>
                        {resetForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{resetForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || authLoading}
                      >
                        {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button
                        variant="link"
                        className="text-sm text-muted-foreground"
                        onClick={() => setActiveTab('signin')}
                      >
                        Voltar ao login
                      </Button>
                    </div>
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;