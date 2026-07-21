import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  ShieldCheck, Loader2, CreditCard, QrCode, 
  Copy, Check, AlertTriangle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SaaSSubscriptionPage() {
  const { gym, refreshAuth } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Fetch SaaS settings (plans and payment details)
  const { data: saasDetails, isLoading } = useQuery({
    queryKey: ['saasDetails'],
    queryFn: async () => {
      const res = await api.get('/settings/saas-details');
      return res.data.data;
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (data: { plan: string; transactionId: string }) => {
      const res = await api.post('/settings/upgrade-request', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast({ title: 'Upgrade request submitted', description: 'Our administrators will review your payment details shortly.', variant: 'success' as any });
      setSelectedPlan(null);
      setTransactionId('');
      refreshAuth(); // Refresh profile state to update gym details in UI
    },
    onError: (err: any) => {
      toast({ title: 'Submission failed', description: err.response?.data?.message || 'Something went wrong', variant: 'destructive' });
    },
  });

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast({ title: 'Copied to clipboard', variant: 'success' as any });
    setTimeout(() => setCopiedText(''), 2000);
  };

  if (isLoading || !gym) {
    return (
      <div className="flex justify-center py-20 page-enter">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Calculate trial days left
  const expiresAt = gym.subscriptionExpiresAt ? new Date(gym.subscriptionExpiresAt).getTime() : 0;
  const daysLeft = Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
  const isExpired = gym.subscriptionPlan === 'free_trial' && daysLeft === 0;

  const getPlanDisplayName = (planId: string) => {
    if (planId === 'free_trial') return '30-Day Free Trial';
    if (!saasDetails?.plans) return planId;
    const plan = saasDetails.plans.find((p: any) => p.id === planId);
    return plan ? plan.name : planId;
  };

  return (
    <div className="space-y-6 max-w-5xl page-enter stagger-children">
      <div>
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-sm text-slate-400 font-medium">Manage your GymArchive SaaS subscription and billing preferences</p>
      </div>

      {/* Expiry Warning Banner */}
      {isExpired && (
        <Card className="border-rose-500/30 bg-rose-500/5 animate-pulse">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-300">Your Free Trial Has Expired</h4>
              <p className="text-xs text-rose-400/90 leading-relaxed mt-1">
                Your 30-day trial of GymArchive has expired. Please select a plan below to upgrade and keep uninterrupted access. Your data remains safe and saved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Status Card */}
      <Card className="p-1 border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-200">Current Subscription</CardTitle>
          <CardDescription className="text-slate-400">Details of your active licensing plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-6 sm:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-100">
                  {getPlanDisplayName(gym.subscriptionPlan)}
                </span>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                  gym.subscriptionStatus === 'pending_approval'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : isExpired
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                )}>
                  {gym.subscriptionStatus === 'pending_approval' 
                    ? 'Upgrade Pending Approval' 
                    : isExpired 
                      ? 'Expired' 
                      : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {gym.subscriptionPlan === 'free_trial' ? (
                  isExpired 
                    ? 'Your trial period has expired.' 
                    : `Your free trial is active. You have ${daysLeft} days remaining.`
                ) : (
                  `Valid until ${new Date(gym.subscriptionExpiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}`
                )}
              </p>
            </div>
            
            {gym.subscriptionStatus === 'pending_approval' && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400 max-w-md">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying Upgrade Request
                </p>
                <p className="text-amber-500/80 leading-relaxed">
                  Your request to upgrade to <strong>{getPlanDisplayName(gym.subscriptionPendingPlan || '')}</strong> is currently being verified. We will update your plan status once approval is complete.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options (3 Fixed Tiers - Prices Hidden) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-bold text-slate-200">Select an Upgrade Plan</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          {saasDetails?.plans?.map((plan: any) => {
            const isCurrent = gym.subscriptionPlan === plan.id;
            const isPending = gym.subscriptionPendingPlan === plan.id;
            const isUpgradeable = gym.subscriptionPlan === 'free_trial' || 
              (gym.subscriptionPlan === 'tier1' && (plan.id === 'tier2' || plan.id === 'tier3')) ||
              (gym.subscriptionPlan === 'tier2' && plan.id === 'tier3');
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  'relative border flex flex-col transition-all duration-300 hover:shadow-xl backdrop-blur-xl',
                  isCurrent 
                    ? 'border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/20' 
                    : isPending
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                )}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[9px] font-bold text-white shadow-sm uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
                {isPending && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-[9px] font-bold text-white shadow-sm uppercase tracking-wider">
                    Pending
                  </span>
                )}
                
                <CardHeader className="pb-3 text-center sm:text-left">
                  <CardTitle className="text-base font-bold text-slate-100">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs min-h-[32px]">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col gap-4">
                  {/* Masked Price */}
                  <div className="pb-3 border-b border-white/5 text-center sm:text-left flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-400 select-none">₹•••</span>
                    <span className="text-xs text-slate-500 select-none">/ year</span>
                    <span className="ml-auto text-[9px] text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Masked</span>
                  </div>

                  {/* Plan Features */}
                  <ul className="space-y-2 flex-1 pt-1">
                    {plan.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Action Button */}
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setTransactionId('');
                      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={!isUpgradeable || gym.subscriptionStatus === 'pending_approval'}
                    variant={isCurrent || isPending ? 'secondary' : 'default'}
                    className={cn(
                      'w-full text-xs font-semibold rounded-xl h-10 transition-all mt-4',
                      isUpgradeable && 'shimmer-btn shadow-lg shadow-violet-500/10'
                    )}
                  >
                    {isCurrent 
                      ? 'Active' 
                      : isPending 
                        ? 'Approval Pending' 
                        : isUpgradeable 
                          ? 'Select Plan' 
                          : 'Not Available'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Screen (Displayed when a plan is selected) */}
      {selectedPlan && (
        <Card id="payment-section" className="p-1 border-violet-500/20 bg-white/[0.02] backdrop-blur-xl animate-scale-in">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-400" />
              Pay for {selectedPlan.name}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Please transfer payment using any of the details below, then enter the transaction ID to request activation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Left Side: Payment Details */}
              <div className="space-y-5">
                {/* UPI details */}
                {saasDetails?.upiId && (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-slate-400">UPI ID</Label>
                    <div className="flex items-center gap-2 bg-slate-800/40 border border-white/5 rounded-xl px-4 py-2.5">
                      <span className="font-semibold text-slate-200 text-sm truncate flex-1">{saasDetails.upiId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(saasDetails.upiId, 'upi')}
                        className="h-8 w-8 text-slate-400 hover:text-white"
                      >
                        {copiedText === 'upi' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bank account details */}
                {saasDetails?.accountDetails && (
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-slate-400">Bank Transfer Details</Label>
                    <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 text-xs">Account Holder</span>
                        <span className="font-medium text-slate-200 text-right">{saasDetails.accountDetails.accountHolder}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400 text-xs">Bank Name</span>
                        <span className="font-medium text-slate-200 text-right">{saasDetails.accountDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <span className="text-slate-400 text-xs">Account Number</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-200">{saasDetails.accountDetails.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(saasDetails.accountDetails.accountNumber, 'acc')}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedText === 'acc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        <span className="text-slate-400 text-xs">IFSC Code</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-200">{saasDetails.accountDetails.ifscCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(saasDetails.accountDetails.ifscCode, 'ifsc')}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedText === 'ifsc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: QR Code & Verification Form */}
              <div className="flex flex-col items-center justify-center border-t border-white/5 pt-6 md:border-t-0 md:pt-0 md:pl-6 md:border-l">
                {saasDetails?.qrCode ? (
                  <div className="flex flex-col items-center gap-3">
                    <Label className="text-xs uppercase tracking-widest text-slate-400 text-center">Scan QR to Pay</Label>
                    <div className="h-44 w-44 rounded-2xl bg-white p-2 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                      <img src={saasDetails.qrCode} alt="Payment QR Code" className="h-full w-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 py-6">
                    <QrCode className="h-12 w-12" strokeWidth={1.5} />
                    <p className="text-xs">No QR Code available</p>
                  </div>
                )}
              </div>

            </div>

            {/* Verification Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!transactionId.trim()) {
                  toast({ title: 'Transaction ID required', description: 'Please enter reference details to continue.', variant: 'destructive' });
                  return;
                }
                upgradeMutation.mutate({ plan: selectedPlan.id, transactionId });
              }}
              className="border-t border-white/5 pt-6 space-y-4 max-w-xl mx-auto"
            >
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-xs uppercase tracking-widest text-slate-400">
                  Transaction Ref ID / UTR *
                </Label>
                <Input 
                  id="transactionId" 
                  placeholder="e.g. UPI Ref 627918..." 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-500">
                  Enter the unique reference / transaction number from your UPI app or bank transfer receipt.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedPlan(null)} 
                  className="rounded-xl flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={upgradeMutation.isPending}
                  className="rounded-xl flex-1 shimmer-btn shadow-lg shadow-violet-500/25"
                >
                  {upgradeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-1.5" /> Request Plan Activation
                    </>
                  )}
                </Button>
              </div>
            </form>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
