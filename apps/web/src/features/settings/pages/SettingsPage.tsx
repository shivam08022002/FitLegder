import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateGymSchema, type UpdateGymInput } from '@/validation';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Settings, Upload, Loader2, Camera } from 'lucide-react';

const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const timezones = [
  'Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Singapore', 'Australia/Sydney',
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { gym, updateGym } = useAuth();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(gym?.logo || null);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateGymInput>({
    resolver: zodResolver(updateGymSchema),
    defaultValues: {
      name: gym?.name || '',
      address: gym?.address || '',
      contactNumber: gym?.contactNumber || '',
      email: gym?.email || '',
      currency: gym?.currency || 'INR',
      timezone: gym?.timezone || 'Asia/Kolkata',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateGymInput) => api.put('/settings', data),
    onSuccess: (res) => {
      updateGym(res.data.data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Settings saved', variant: 'success' as any });
      navigate('/');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      return api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      updateGym(res.data.data);
      setLogoPreview(res.data.data.logo);
      toast({ title: 'Logo uploaded', variant: 'success' as any });
      navigate('/');
    },
    onError: () => {
      toast({ title: 'Failed to upload logo', variant: 'destructive' });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      logoMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl page-enter stagger-children">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-400 font-medium">Manage your gym profile, branding, and billing currency preferences</p>
      </div>

      {/* Logo */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-200">Gym Logo</CardTitle>
          <CardDescription className="text-slate-400">Upload your branding logo image (max 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative group shrink-0">
              <div className="h-24 w-24 rounded-2xl bg-slate-800/20 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-colors group-hover:border-violet-500/50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Gym logo" className="h-full w-full object-cover animate-scale-in" />
                ) : (
                  <Camera className="h-7 w-7 text-slate-500" strokeWidth={1.5} />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer hover:bg-black/60 transition-all">
                <Upload className="h-5 w-5 text-white" />
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-200">Upload branding image</p>
              <p className="mt-0.5">Click layout box to search files.</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG or SVG formats supported</p>
              {logoMutation.isPending && (
                <p className="text-xs text-violet-400 mt-2 flex items-center gap-1.5 font-semibold">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading logo image...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-200">Gym Profile</CardTitle>
          <CardDescription className="text-slate-400">Basic contact and metadata details of the gym</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Gym Name</Label>
                <Input {...register('name')} placeholder="Enter Gym Name" />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Email Address</Label>
                <Input type="email" {...register('email')} placeholder="Enter Email" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Contact Number</Label>
                <Input {...register('contactNumber')} placeholder="Enter Contact Number" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Address</Label>
                <Input {...register('address')} placeholder="Enter Address" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Currency</Label>
                <select {...register('currency')} className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50">
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Timezone</Label>
                <select {...register('timezone')} className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50">
                  {timezones.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2 rounded-xl mt-2 px-6 h-11 shimmer-btn">
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" strokeWidth={1.5} />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
