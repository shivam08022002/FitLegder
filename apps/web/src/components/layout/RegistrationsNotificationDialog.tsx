import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Loader2, Mail, Phone, Hash, ExternalLink, Info, BellRing, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface RegistrationsNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationsNotificationDialog({ open, onOpenChange }: RegistrationsNotificationDialogProps) {
  const queryClient = useQueryClient();

  const { data: registrations, refetch, isLoading } = useQuery({
    queryKey: ['pendingRegistrations'],
    queryFn: async () => {
      const res = await api.get('/events/registrations/pending');
      return res.data.data;
    },
    enabled: false,
  });

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const statusMutation = useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: 'approved' | 'rejected' }) => {
      return api.put(`/events/registrations/${registrationId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRegistrationsCount'] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
      toast({
        title: 'Success',
        description: `Registration has been ${variables.status === 'approved' ? 'approved' : 'declined'} successfully.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-400" />
            <DialogTitle className="text-xl font-bold">Pending Registrations</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-sm">
            Verify payment details (UTR & Screenshots) to approve event entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-xs text-slate-400 mt-2">Refreshing registration list...</p>
            </div>
          ) : !registrations || registrations.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Info className="h-10 w-10 mx-auto opacity-30 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">No pending registration requests to verify.</p>
            </div>
          ) : (
            registrations.map((reg: any) => (
              <Card key={reg._id} className="border-white/[0.06] bg-slate-900/40 hover:bg-slate-900/60 transition-colors rounded-2xl overflow-hidden shadow-lg">
                <CardContent className="p-5 flex flex-col gap-4">
                  
                  {/* Top line: Event title & User details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        {reg.event?.title || 'Unknown Event'}
                      </span>
                      <h4 className="text-base font-bold text-slate-100 mt-2">{reg.name}</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body grid: email, phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                    {reg.email ? (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{reg.email}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 text-slate-500 italic">
                        <Mail className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        No Email Provided
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {reg.phone}
                    </p>
                  </div>

                  {reg.utr && (
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-400">Reference / UTR:</span>
                        <span className="font-mono text-slate-100 font-bold truncate select-all">{reg.utr}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-white/5 rounded-lg shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(reg.utr);
                          toast({ title: 'Copied Reference!', description: 'UTR reference number copied.' });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  )}

                  {/* Screenshot display & Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-t border-white/5 pt-3 mt-1">
                    {reg.paymentScreenshot ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-slate-950">
                          <img
                            src={reg.paymentScreenshot}
                            alt="Screenshot"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-300">Payment Screenshot</span>
                          <a
                            href={reg.paymentScreenshot}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mt-0.5"
                          >
                            View Receipt <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No payment screenshot attached</span>
                    )}

                    <div className="flex gap-2.5 sm:w-auto">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 sm:flex-initial sm:w-24 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl border border-rose-500/10 gap-1.5 h-9 text-xs font-semibold"
                        onClick={() => statusMutation.mutate({ registrationId: reg._id, status: 'rejected' })}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && statusMutation.variables?.registrationId === reg._id && statusMutation.variables?.status === 'rejected' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Decline
                      </Button>
                      
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-initial sm:w-24 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5 h-9 text-xs font-semibold"
                        onClick={() => statusMutation.mutate({ registrationId: reg._id, status: 'approved' })}
                        disabled={statusMutation.isPending}
                      >
                        {statusMutation.isPending && statusMutation.variables?.registrationId === reg._id && statusMutation.variables?.status === 'approved' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
