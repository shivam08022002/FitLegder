import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import fitledgerIcon from '@/Assets/fitledger_app_icon.svg';
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, Lock, ShieldAlert } from 'lucide-react';

const clientResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ClientResetInput = z.infer<typeof clientResetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientResetInput>({
    resolver: zodResolver(clientResetSchema),
  });

  const onSubmit = async (data: ClientResetInput) => {
    if (!token) {
      toast({
        title: 'Invalid Request',
        description: 'Reset token is missing from the URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Your password has been successfully reset.',
        variant: 'success' as any,
      });
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.response?.data?.message || 'Invalid or expired reset token',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-0 flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <div className="auth-bg grid-pattern" />
      <Card className="w-full max-w-[420px] border-white/10 bg-card/60 backdrop-blur-xl animate-scale-in p-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-logo-pulse">
            <img src={fitledgerIcon} className="h-9 w-9" alt="FitLedger" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Create New Password
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-1">
            {isSuccess 
              ? 'Password reset is complete' 
              : 'Enter and confirm your new password below'}
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-300">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <CardFooter className="flex-col gap-4 px-0 pb-0">
              <Link to="/login" className="w-full">
                <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                  Proceed to Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {!token && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Warning: No password reset token was found in the URL link. Password reset will fail without a valid token.</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-slate-400">New Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-slate-400">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="pl-10"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex-col gap-3 pt-2">
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 shimmer-btn" disabled={isSubmitting || !token}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
              <Link to="/login" className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors py-1">
                Cancel
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
