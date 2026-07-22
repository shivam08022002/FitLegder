import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatMoney, formatDate, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, ArrowUpRight, Loader2, Plus, Calendar, AlertTriangle } from 'lucide-react';

export default function RenewalsPage() {
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const { data: members = [] } = useQuery({
    queryKey: ['members-list'],
    queryFn: async () => {
      const res = await api.get('/members', { params: { limit: 1000 } });
      return res.data.data;
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data.data;
    },
  });

  const renewMutation = useMutation({
    mutationFn: (data: any) => api.post('/renewals/renew', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowRenewDialog(false);
      toast({ title: `Membership ${res.data.data.outcome || 'renewed'}`, variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  const extendMutation = useMutation({
    mutationFn: (data: any) => api.post('/renewals/extend', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setShowExtendDialog(false);
      toast({ title: 'Membership extended', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  // Show members with active/expiring memberships for renewal actions
  const membersWithMembership = members.filter((m: any) => m.latestMembership);

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Renewals</h1>
          <p className="text-sm text-slate-400">Renew, upgrade, or extend member subscriptions</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setShowRenewDialog(true)} className="gap-2 shadow-lg shadow-emerald-500/20">
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> Renew / Upgrade
          </Button>
          <Button onClick={() => setShowExtendDialog(true)} variant="secondary" className="gap-2">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} /> Extend
          </Button>
        </div>
      </div>

      {membersWithMembership.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <RefreshCw className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">No active memberships</p>
            <p className="text-sm text-slate-400">Record payments to activate member packages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {membersWithMembership.map((m: any) => {
            const isExpired = m.latestMembership?.endDate ? new Date(m.latestMembership.endDate).getTime() < new Date().getTime() : false;
            return (
              <Card 
                key={m._id} 
                className={cn(
                  "overflow-hidden border backdrop-blur-xl hover:translate-x-1 duration-300 transition-all",
                  isExpired 
                    ? "bg-rose-500/5 border-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.02)]" 
                    : "bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                )}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm font-bold text-white text-sm",
                      isExpired 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {m.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-100 truncate">{m.fullName}</p>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0">
                          {m.latestMembership?.planDetails?.name || 'N/A'}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3 text-slate-400" strokeWidth={1.5} /> 
                          Expires: {m.latestMembership?.endDate ? formatDate(m.latestMembership.endDate, gym?.timezone) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant={isExpired ? "default" : "secondary"} 
                    size="sm" 
                    className="gap-1.5 rounded-xl self-end sm:self-center h-8 text-xs shrink-0" 
                    onClick={() => {
                      setSelectedMemberId(m._id);
                      setShowRenewDialog(true);
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} /> Renew Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Renew / Upgrade Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={(v) => { if (!v) setShowRenewDialog(false); }}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Renew / Upgrade Membership</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">Select the same plan to renew, or a different plan to upgrade</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget);
            renewMutation.mutate({ memberId: fd.get('memberId'), planId: fd.get('planId'), amount: Number(fd.get('amount')), method: fd.get('method'), startDate: fd.get('startDate') || undefined, notes: fd.get('notes') || '' });
          }} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Member *</Label>
              <select 
                name="memberId" 
                value={selectedMemberId} 
                onChange={(e) => setSelectedMemberId(e.target.value)} 
                required 
                className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-emerald-400/60"
              >
                <option value="">Select member</option>
                {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Select Plan *</label>
              <select name="planId" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-emerald-400/60">
                <option value="">-- Select Plan --</option>
                {plans.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.durationInDays || p.durationMonths * 30} days - {formatMoney(p.price, gym?.currency)})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Amount Paid</Label>
                <Input name="amount" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Method</Label>
                <select name="method" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-emerald-400/60">
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Start Date</Label>
              <Input name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Notes</Label>
              <Input name="notes" placeholder="Transaction or general notes" />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowRenewDialog(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={renewMutation.isPending} className="rounded-xl shimmer-btn">
                {renewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Renew'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={(v) => { if (!v) setShowExtendDialog(false); }}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Extend Membership</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">Add extra grace days to a current membership</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget);
            const member = members.find((m: any) => m._id === fd.get('memberId'));
            if (member?.latestMembership?._id) { 
              extendMutation.mutate({ membershipId: member.latestMembership._id, additionalDays: Number(fd.get('additionalDays')) }); 
            } else { 
              toast({ title: 'No active membership found', variant: 'destructive' }); 
            }
          }} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Member *</Label>
              <select name="memberId" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-emerald-400/60">
                <option value="">Select member</option>
                {membersWithMembership.map((m: any) => <option key={m._id} value={m._id}>{m.fullName}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Additional Days *</Label>
              <Input name="additionalDays" type="number" min="1" max="365" required placeholder="e.g. 7" />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowExtendDialog(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={extendMutation.isPending} className="rounded-xl shimmer-btn">
                {extendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extend'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
