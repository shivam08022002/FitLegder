import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Upload, QrCode, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperadminSaaSSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'payments' | 'plans'>('payments');
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  // Fetch SaaS settings
  const { data: saasSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['superadmin', 'saasSettings'],
    queryFn: async () => {
      const res = await api.get('/superadmin/saas-settings');
      if (res.data.data?.qrCode) {
        setQrPreview(res.data.data.qrCode);
      }
      return res.data.data;
    },
  });

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => api.put('/superadmin/saas-settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'saasSettings'] });
      toast({ title: 'SaaS configuration saved', variant: 'success' as any });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to save settings', description: err.response?.data?.message, variant: 'destructive' });
    },
  });

  // Form states for config
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Plans form states
  const [plans, setPlans] = useState<Array<{ id: string; name: string; description: string; features: string }>>([
    { id: 'tier1', name: '', description: '', features: '' },
    { id: 'tier2', name: '', description: '', features: '' },
    { id: 'tier3', name: '', description: '', features: '' },
  ]);

  // Initializing state when settings are loaded
  const handleConfigLoad = () => {
    if (!saasSettings) return;
    setUpiId(saasSettings.upiId || '');
    if (saasSettings.accountDetails) {
      setAccountHolder(saasSettings.accountDetails.accountHolder || '');
      setBankName(saasSettings.accountDetails.bankName || '');
      setAccountNumber(saasSettings.accountDetails.accountNumber || '');
      setIfscCode(saasSettings.accountDetails.ifscCode || '');
    }
    if (saasSettings.plans) {
      setPlans(saasSettings.plans.map((p: any) => ({
        id: p.id,
        name: p.name || '',
        description: p.description || '',
        features: p.features ? p.features.join('\n') : '',
      })));
    }
  };

  // Run initial configuration load if data changes
  useEffect(() => {
    if (saasSettings) {
      handleConfigLoad();
    }
  }, [saasSettings]);

  const handleQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setQrPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      upiId,
      qrCode: qrPreview || '',
      accountDetails: {
        accountHolder,
        bankName,
        accountNumber,
        ifscCode,
      },
      plans: plans.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        features: p.features.split('\n').map(f => f.trim()).filter(Boolean),
      })),
    };
    saveSettingsMutation.mutate(payload);
  };

  const handlePlanChange = (index: number, field: 'name' | 'description' | 'features', value: string) => {
    setPlans(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as any;
      return next;
    });
  };

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">SaaS Settings</h1>
          <p className="text-sm text-slate-400 font-medium">Manage pricing plans and global payment gateways.</p>
        </div>
        
        {/* Premium Tab Control */}
        <div className="flex bg-white/[0.03] border border-white/5 p-1.5 rounded-xl shrink-0 w-full sm:w-auto gap-1">
          <button
            onClick={() => {
              setActiveTab('payments');
              handleConfigLoad();
            }}
            className={cn(
              'flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 border text-center whitespace-nowrap',
              activeTab === 'payments' 
                ? 'bg-emerald-600 text-slate-950 border-emerald-500/20 shadow-lg shadow-emerald-600/20 font-bold' 
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            )}
          >
            Payment Gateways
          </button>
          <button
            onClick={() => {
              setActiveTab('plans');
              handleConfigLoad();
            }}
            className={cn(
              'flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 border text-center whitespace-nowrap',
              activeTab === 'plans' 
                ? 'bg-emerald-600 text-white border-emerald-500/20 shadow-lg shadow-emerald-600/20' 
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
            )}
          >
            Subscription Plans
          </button>
        </div>
      </div>

      {activeTab === 'payments' && (
        <form onSubmit={handleSave} className="space-y-6">
          {loadingSettings ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Payment Settings Card */}
              <Card className="p-1 border-white/5 bg-white/[0.02] backdrop-blur-xl animate-scale-in">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200">Global Payment Details</CardTitle>
                  <CardDescription className="text-slate-400">UPI, Bank transfer coordinates, and QR code for upgrade payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">UPI ID</Label>
                      <Input 
                        placeholder="fitledger@upi" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Bank Holder Name</Label>
                      <Input 
                        placeholder="GymArchive Technologies Private Limited" 
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Bank Name</Label>
                      <Input 
                        placeholder="ICICI Bank" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">Account Number</Label>
                      <Input 
                        placeholder="501004829184" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-slate-400">IFSC Code</Label>
                      <Input 
                        placeholder="ICIC0000104" 
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-slate-400">Payment QR Code</Label>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="relative group shrink-0">
                        <div className="h-32 w-32 rounded-2xl bg-white p-2 border border-slate-700/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-400">
                          {qrPreview ? (
                            <img src={qrPreview} alt="QR preview" className="h-full w-full object-contain animate-scale-in" />
                          ) : (
                            <QrCode className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl cursor-pointer hover:bg-black/60 transition-all">
                          <Upload className="h-5 w-5 text-white" />
                          <input type="file" accept="image/*" onChange={handleQRChange} className="hidden" />
                        </label>
                      </div>
                      
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <p className="font-semibold text-slate-200">Upload payment QR image</p>
                        <p className="mt-0.5">Click box to upload or drag QR screenshot image.</p>
                        <p className="text-[10px] text-slate-500 mt-1">Accepts PNG, JPG format. Saved locally in database settings.</p>
                        {qrPreview && (
                          <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => setQrPreview(null)}
                            className="h-auto p-0 text-xs text-rose-400 mt-1.5 font-bold hover:text-rose-300"
                          >
                            Remove QR Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form submit row */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={saveSettingsMutation.isPending}
                  className="rounded-xl px-8 h-11 shimmer-btn shadow-lg shadow-emerald-500/20"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving Details...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-1.5" /> Save Payment Gateways
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      )}

      {activeTab === 'plans' && (
        <form onSubmit={handleSave} className="space-y-6">
          {loadingSettings ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Plans Editing Card */}
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-200">SaaS Upgrade Pricing Tiers (Prices Hidden)</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {plans.map((plan, index) => (
                    <Card key={plan.id} className="p-1 border-white/5 bg-white/[0.02] backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-300">
                          {plan.id === 'tier1' ? 'Tier 1 (Starter)' : plan.id === 'tier2' ? 'Tier 2 (Growth)' : 'Tier 3 (Enterprise)'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3.5">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase tracking-widest text-slate-400">Plan Display Name</Label>
                          <Input 
                            value={plan.name}
                            onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                            placeholder="e.g. Starter Plan"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase tracking-widest text-slate-400">Plan Description</Label>
                          <Input 
                            value={plan.description}
                            onChange={(e) => handlePlanChange(index, 'description', e.target.value)}
                            placeholder="e.g. Best for growing gyms"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase tracking-widest text-slate-400">Features List (one per line)</Label>
                          <Textarea 
                            rows={6}
                            value={plan.features}
                            onChange={(e) => handlePlanChange(index, 'features', e.target.value)}
                            placeholder="Up to 100 members&#10;Attendance tracker&#10;Basic reports"
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Form submit row */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={saveSettingsMutation.isPending}
                  className="rounded-xl px-8 h-11 shimmer-btn shadow-lg shadow-emerald-500/20"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving Plans...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-1.5" /> Save Pricing Plans
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
