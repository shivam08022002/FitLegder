import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';

const clientChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

type ClientChangePasswordInput = z.infer<typeof clientChangePasswordSchema>;

export default function ChangePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientChangePasswordInput>({
    resolver: zodResolver(clientChangePasswordSchema),
  });

  const onSubmit = async (data: ClientChangePasswordInput) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: 'Success!',
        description: 'Your password has been changed successfully.',
        variant: 'success' as any,
      });
      reset();
    } catch (error: any) {
      toast({
        title: 'Change failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md page-enter">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-slate-400">Manage your account security and password</p>
      </div>

      <Card className="border-white/10 bg-card/60 backdrop-blur-xl p-1">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <KeyRound className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription className="text-slate-400">Update your login credentials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs uppercase tracking-widest text-slate-400">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter Current Password"
                  className="pl-10"
                  {...register('currentPassword')}
                />
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs uppercase tracking-widest text-slate-400">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter New Password"
                  className="pl-10 pr-10"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-xs uppercase tracking-widest text-slate-400">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
                <Input
                  id="confirmNewPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  className="pl-10"
                  {...register('confirmNewPassword')}
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="text-xs text-red-400">{errors.confirmNewPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl text-sm font-semibold shimmer-btn">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
