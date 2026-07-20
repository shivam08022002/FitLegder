import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatMoney, formatDate, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Plus, Loader2, ArrowRight, Search, Filter, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showRecordDialog, setShowRecordDialog] = useState(searchParams.get('action') === 'record');
  const [page, setPage] = useState(1);

  // Filter & Sort state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, search, sortBy],
    queryFn: async () => {
      const params: any = { page, limit: 20, sortBy };
      if (search) params.search = search;
      const res = await api.get('/payments', { params });
      return res.data;
    },
  });

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

  const recordMutation = useMutation({
    mutationFn: (data: any) => api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setShowRecordDialog(false);
      toast({ title: 'Payment recorded', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  const payments = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-slate-400">{pagination.total} total transactions logged</p>
        </div>
        <Button onClick={() => setShowRecordDialog(true)} className="gap-2 self-start shrink-0">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Record Payment
        </Button>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
          <Input
            placeholder="Search by member name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 h-10 rounded-xl"
          />
        </div>

        {/* Sort select */}
        <div className="relative w-full sm:w-48 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="a-z">🔤 A to Z</option>
            <option value="dues">⚠️ Dues First</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <CreditCard className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">
              {search ? 'No payments match your search' : 'No payments yet · First one coming soon?'}
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {search ? 'Try adjusting your search query' : 'Log manual membership cash or online collections'}
            </p>
            {search ? (
              <Button onClick={() => setSearch('')} variant="outline" className="gap-2 rounded-xl">
                <X className="h-4 w-4" strokeWidth={1.5} /> Clear Search
              </Button>
            ) : (
              <Button onClick={() => setShowRecordDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" strokeWidth={1.5} /> Record Payment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => {
            const hasDue = p.balanceDue > 0;
            return (
              <Card key={p._id} className="overflow-hidden border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl hover:translate-x-1 duration-300">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{p.member?.fullName || 'Unknown'}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
                        <span>{formatDate(p.paymentDate, gym?.timezone)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="uppercase font-semibold text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{p.method}</span>
                        {p.membership?.plan?.name && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-violet-400 font-medium">{p.membership.plan.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount Paid + Due Amount */}
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-white/5 shrink-0 justify-between sm:justify-end">
                    {/* Due Amount */}
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Due</span>
                      <span className={cn(
                        "text-sm font-bold flex items-center gap-1",
                        hasDue ? "text-amber-400" : "text-emerald-400/70"
                      )}>
                        {hasDue ? (
                          <>
                            <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                            {formatMoney(p.balanceDue, gym?.currency)}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                            Paid
                          </>
                        )}
                      </span>
                    </div>

                    {/* Amount Paid */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium sm:hidden">Paid</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-400">+{formatMoney(p.amount, gym?.currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl">Previous</Button>
              <span className="text-xs text-slate-400">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded-xl">Next</Button>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={(v) => { if (!v) setShowRecordDialog(false); }}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Record Payment</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">Log custom cash or digital transfer collections</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget);
            recordMutation.mutate({
              memberId: fd.get('memberId'), planId: fd.get('planId'),
              amount: Number(fd.get('amount')), method: fd.get('method'),
              paymentDate: fd.get('paymentDate') || new Date().toISOString(),
              notes: fd.get('notes') || '', startDate: fd.get('startDate') || undefined,
            });
          }} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Member *</Label>
              <select name="memberId" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50">
                <option value="">Select member</option>
                {members.map((m: any) => <option key={m._id} value={m._id}>{m.fullName} — {m.phone}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Plan *</Label>
              <select name="planId" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50">
                <option value="">Select plan</option>
                {plans.filter((p: any) => p.isActive).map((p: any) => <option key={p._id} value={p._id}>{p.name} — {formatMoney(p.price, gym?.currency)}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Amount *</Label>
                <Input name="amount" type="number" required min="0.01" step="0.01" placeholder="Enter Amount" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Method *</Label>
                <select name="method" required className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500/50">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Payment Date</Label>
                <Input name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400">Start Date</Label>
                <Input name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Notes</Label>
              <Input name="notes" placeholder="Enter Notes" />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowRecordDialog(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={recordMutation.isPending} className="rounded-xl shimmer-btn">
                {recordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
