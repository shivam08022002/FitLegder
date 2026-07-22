import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/validation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import gymLogo from '@/Assets/gymlogo2.png';
import { Loader2, Eye, EyeOff, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in.',
        variant: 'success' as any
      });
      navigate('/');
    } catch (err: any) {
      toast({
        title: 'Authentication failed',
        description: err.response?.data?.message || 'Invalid credentials',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-0 flex min-h-screen items-center justify-center p-4 overflow-hidden bg-[#050508]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="aurora-blob aurora-blob-anim left-[-10%] top-[-5%] h-[520px] w-[520px] bg-emerald-600/20 [animation:aurora-drift_16s_ease-in-out_infinite]" />
        <div className="aurora-blob right-[-8%] top-[20%] h-[460px] w-[460px] bg-lime-500/15 [animation:aurora-drift_20s_ease-in-out_infinite_reverse]" />
        <div className="aurora-blob bottom-[-10%] left-[30%] h-[500px] w-[500px] bg-sky-500/15 [animation:aurora-drift_24s_ease-in-out_infinite]" />
      </div>
      <Card className="w-full max-w-[420px] border-emerald-500/20 bg-[#050508]/80 shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)] backdrop-blur-2xl animate-scale-in p-2">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <img src={gymLogo} className="h-10 w-auto object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" alt="GymArchive" />
          </div>
          <CardTitle className="text-xl font-bold text-balance">Welcome back</CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-1">Sign in to manage your gym dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-slate-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Email"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-slate-400">Password</Label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute left-0 right-0 h-px bg-white/5"></div>
              <span className="relative z-10 px-3 text-[10px] uppercase tracking-widest text-slate-500 bg-[#050508] rounded-full border border-white/5 py-0.5">
                Credential Authentication
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-2">
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 shimmer-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="w-full flex flex-col items-center gap-2 mt-1">
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition-all font-semibold hover:underline decoration-emerald-400 decoration-2 underline-offset-4">
                  Create one
                </Link>
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                <Sparkles className="h-3 w-3" />
                Includes a 30-day free trial
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-4 border-t border-white/5 pt-4 w-full justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Secure 256-bit SSL encrypted connection</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
