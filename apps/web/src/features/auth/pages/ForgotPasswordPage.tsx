import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@gym-saas/validation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import fitledgerIcon from '@/Assets/fitledger_app_icon.svg';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSent(true);
      toast({
        title: 'Reset link generated',
        description: 'Check the API server console for the reset password link.',
        variant: 'success' as any,
      });
    } catch (error: any) {
      toast({
        title: 'Error requesting reset',
        description: error.response?.data?.message || 'Something went wrong',
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mt-1">
            {isSent 
              ? 'Password reset instructions have been generated' 
              : 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        
        {isSent ? (
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground font-semibold">
                If the email is registered, a password reset link has been generated.
              </p>
              <div className="rounded-xl border border-white/5 bg-slate-900/30 p-4 text-xs text-slate-400 text-left space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-200">Next Steps:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Check your API server console (where the backend runs).</li>
                  <li>Locate the line starting with <code>🔑 Password reset token...</code>.</li>
                  <li>Click or copy the <code>Reset URL</code> link to reset your password.</li>
                </ol>
              </div>
            </div>
            <CardFooter className="flex-col gap-4 px-0 pb-0">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-xl h-11">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-slate-400">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.5} />
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
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-2">
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 shimmer-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending Request...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full flex items-center justify-center gap-2 h-11 hover:bg-white/5">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
