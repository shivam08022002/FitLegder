import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@gym-saas/validation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import fitledgerLockup from '@/Assets/fitledger_lockup_columnweights.svg';
import { Loader2, Eye, EyeOff, User, Phone, Dumbbell, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast({ title: 'Account created!', description: 'Welcome to FitLedger', variant: 'success' as any });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-0 flex min-h-screen items-center justify-center p-3 sm:p-4 overflow-hidden bg-[#050508]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="aurora-blob aurora-blob-anim left-[-10%] top-[-5%] h-[520px] w-[520px] bg-violet-600/25 [animation:aurora-drift_16s_ease-in-out_infinite]" />
        <div className="aurora-blob right-[-8%] top-[20%] h-[460px] w-[460px] bg-fuchsia-500/20 [animation:aurora-drift_20s_ease-in-out_infinite_reverse]" />
        <div className="aurora-blob bottom-[-10%] left-[30%] h-[500px] w-[500px] bg-sky-500/15 [animation:aurora-drift_24s_ease-in-out_infinite]" />
      </div>
      <Card className="w-full max-w-[440px] border-white/[0.08] bg-[#050508]/40 shadow-[0_0_50px_-12px_rgba(139,92,246,0.25)] backdrop-blur-2xl animate-scale-in p-1 sm:p-2">
        <CardHeader className="text-center pb-2 pt-4 px-4 sm:px-6">
          <div className="mx-auto mb-2 flex items-center justify-center">
            <img src={fitledgerLockup} className="h-12 object-contain drop-shadow-[0_0_25px_rgba(139,92,246,0.35)]" alt="FitLedger" />
          </div>
          <CardTitle className="text-lg font-bold text-balance">Create your account</CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-0.5">Start managing your gym in minutes</CardDescription>
          <div className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            30-day free trial &middot; No card required
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-3 px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[11px] uppercase tracking-widest text-slate-400">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                  <Input id="name" placeholder="Enter Name" className="pl-9 h-9 text-sm" {...register('name')} />
                </div>
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[11px] uppercase tracking-widest text-slate-400">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                  <Input id="phone" placeholder="Enter Phone" className="pl-9 h-9 text-sm" {...register('phone')} />
                </div>
                {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="gymName" className="text-[11px] uppercase tracking-widest text-slate-400">Gym Name</Label>
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                <Input id="gymName" placeholder="Enter Gym Name" className="pl-9 h-9 text-sm" {...register('gymName')} />
              </div>
              {errors.gymName && <p className="text-xs text-red-400">{errors.gymName.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-widest text-slate-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                <Input id="email" type="email" placeholder="Enter Email" className="pl-9 h-9 text-sm" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-widest text-slate-400">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    className="pl-9 pr-9 h-9 text-sm"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[11px] uppercase tracking-widest text-slate-400">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="pl-9 h-9 text-sm"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-2 pb-4 px-4 sm:px-6">
            <Button type="submit" className="w-full h-10 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 shimmer-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-all font-semibold hover:underline decoration-violet-400 decoration-2 underline-offset-4">
                Sign in
              </Link>
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 border-t border-white/5 pt-3 w-full justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Secure 256-bit SSL encrypted connection</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
