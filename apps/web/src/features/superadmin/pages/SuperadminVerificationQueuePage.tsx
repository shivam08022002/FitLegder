import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Building, Check, X, ClipboardCheck } from 'lucide-react';

export default function SuperadminVerificationQueuePage() {
  const queryClient = useQueryClient();

  // Fetch pending upgrades
  const { data: pendingUpgrades = [], isLoading: loadingUpgrades } = useQuery({
    queryKey: ['superadmin', 'pendingUpgrades'],
    queryFn: async () => {
      const res = await api.get('/superadmin/upgrades/pending');
      return res.data.data;
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (gymId: string) => api.post(`/superadmin/upgrades/${gymId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'pendingUpgrades'] });
      toast({ title: 'Upgrade request approved', description: 'Gym subscription has been successfully updated.', variant: 'success' as any });
    },
    onError: (err: any) => {
      toast({ title: 'Approval failed', description: err.response?.data?.message, variant: 'destructive' });
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: (gymId: string) => api.post(`/superadmin/upgrades/${gymId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'pendingUpgrades'] });
      toast({ title: 'Upgrade request rejected', variant: 'success' as any });
    },
    onError: (err: any) => {
      toast({ title: 'Rejection failed', description: err.response?.data?.message, variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div>
        <h1 className="text-2xl font-bold">Verification Queue</h1>
        <p className="text-sm text-slate-400 font-medium">Verify gym payment transactions and approve license upgrades.</p>
      </div>

      <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-200">Pending Upgrade Requests</CardTitle>
          <CardDescription className="text-slate-400">Verifying payments for gym owner SaaS licenses</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUpgrades ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : pendingUpgrades.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <ClipboardCheck className="h-10 w-10 text-slate-500 mb-2" strokeWidth={1.5} />
              <p className="text-sm text-slate-400 font-semibold">Verification queue is empty</p>
              <p className="text-xs text-slate-500 mt-0.5">No pending upgrade requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Gym / Owner</th>
                    <th className="py-3 px-4">Requested Plan</th>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingUpgrades.map((gym: any) => (
                    <tr key={gym._id} className="hover:bg-white/[0.01] transition-colors text-slate-300">
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/10">
                            <Building className="h-4.5 w-4.5" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-slate-100 font-bold">{gym.name}</p>
                            <p className="text-xs text-slate-400">{gym.owner?.name} ({gym.owner?.email})</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {gym.subscriptionPendingPlan === 'tier1' 
                          ? 'Starter Plan' 
                          : gym.subscriptionPendingPlan === 'tier2' 
                            ? 'Growth Plan' 
                            : gym.subscriptionPendingPlan === 'tier3'
                              ? 'Enterprise Plan'
                              : gym.subscriptionPendingPlan}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-800/60 border border-white/5 rounded-lg px-2.5 py-1 font-mono text-xs text-violet-300 select-all">
                          {gym.subscriptionPaymentDetails?.transactionId || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {gym.subscriptionPaymentDetails?.submittedAt 
                          ? new Date(gym.subscriptionPaymentDetails.submittedAt).toLocaleString() 
                          : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              if (confirm(`Approve upgrade for ${gym.name}?`)) approveMutation.mutate(gym._id);
                            }}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold gap-1 shadow-md shadow-emerald-600/15"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`Reject upgrade request for ${gym.name}?`)) rejectMutation.mutate(gym._id);
                            }}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-xl border-rose-500/20 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-bold gap-1"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
