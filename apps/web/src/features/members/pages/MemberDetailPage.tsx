import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatDate, formatDateTime, formatMoney, getMembershipStatus, getStatusLabel, getStatusClass, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Clock,
  CreditCard, Plus, RefreshCw, User, ShieldAlert, Loader2, Award,
  ClipboardCheck, X
} from 'lucide-react';

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['member-detail', id],
    queryFn: async () => {
      const res = await api.get(`/members/${id}`);
      return res.data.data;
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => api.post('/payments', paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowPayDialog(false);
      toast({ title: 'Payment recorded successfully', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to record payment',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const renewMutation = useMutation({
    mutationFn: (renewalData: any) => api.post('/renewals/renew', renewalData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['member-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowRenewDialog(false);
      toast({ title: `Membership ${res.data.data.outcome || 'renewed'} successfully`, variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to renew membership',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data.data;
    },
  });

  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['member-attendance', id],
    queryFn: async () => {
      const res = await api.get(`/members/${id}/attendance`);
      return res.data.data as any[];
    },
    enabled: !!id,
  });

  const undoAttendanceMutation = useMutation({
    mutationFn: (dateStr: string) => api.delete(`/members/${id}/attendance/${dateStr}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-attendance', id] });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      toast({ title: 'Attendance record removed', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove record',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 text-center py-20">
        <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="text-xl font-bold">Failed to load member profile</h2>
        <Button onClick={() => navigate('/members')} variant="outline">
          Back to Members List
        </Button>
      </div>
    );
  }

  const { member, memberships, payments } = data;
  const currentMembership = memberships[0]; // memberships are sorted by startDate desc
  const status = getMembershipStatus(currentMembership?.endDate);

  return (
    <div className="space-y-4 page-enter">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')} className="h-8 w-8 rounded-lg hover:bg-white/5">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{member.fullName}</h1>
            <p className="text-xs text-slate-400">Joined on {formatDate(member.joiningDate, gym?.timezone)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {currentMembership ? (
            <>
              <Button onClick={() => setShowPayDialog(true)} variant="outline" className="gap-1.5 border-white/10 h-9 text-xs rounded-xl">
                <CreditCard className="h-3.5 w-3.5" /> Record Payment
              </Button>
              <Button onClick={() => setShowRenewDialog(true)} className="gap-1.5 h-9 text-xs rounded-xl shadow-lg shadow-violet-500/20">
                <RefreshCw className="h-3.5 w-3.5" /> Renew / Upgrade
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowRenewDialog(true)} className="gap-1.5 h-9 text-xs rounded-xl shadow-lg shadow-violet-500/20">
              <Plus className="h-3.5 w-3.5" /> Create Membership
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Left Column: Personal info & Emergency Contact */}
        <div className="space-y-3 lg:col-span-1">
          <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-200">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                  {member.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Badge variant={status as any} className="text-[10px] px-2 py-0.5 rounded-full">{getStatusLabel(status)}</Badge>
                  {currentMembership?.endDate && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Expires: {formatDate(currentMembership.endDate, gym?.timezone)}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>{member.phone}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Mail className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>{member.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="capitalize">{member.gender}</span>
                </div>
                {member.dateOfBirth && (
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    <span>DOB: {formatDate(member.dateOfBirth, gym?.timezone)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {member.emergencyContact && (
            <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-slate-200">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Name</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{member.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Phone Number</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{member.emergencyContact.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {member.notes && (
            <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-slate-200">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Membership History & Payment History */}
        <div className="space-y-3 lg:col-span-2">
          {/* Memberships */}
          <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-200">Membership History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {memberships.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No membership history</p>
              ) : (
                <div className="space-y-2">
                  {memberships.map((m: any) => {
                    const isExpired = new Date(m.endDate).getTime() < new Date().getTime();
                    return (
                      <div 
                        key={m._id} 
                        className={cn(
                          "flex flex-col gap-2 rounded-xl p-3 border transition-all duration-300",
                          isExpired 
                            ? "bg-rose-500/5 border-rose-500/10" 
                            : "bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                              isExpired 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}>
                              <Award className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-100 truncate">{m.plan?.name || 'Unknown Plan'}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {formatDate(m.startDate, gym?.timezone)} to {formatDate(m.endDate, gym?.timezone)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-slate-200">{formatMoney(m.plan?.price || 0, gym?.currency)}</p>
                            {m.balanceDue > 0 && (
                              <p className="text-[10px] text-orange-400 font-semibold mt-0.5">
                                Due: {formatMoney(m.balanceDue, gym?.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                        {m.outcome && (
                          <div className="mt-0.5 flex justify-between items-center">
                            <Badge variant="secondary" className="text-[9px] uppercase tracking-wider px-1.5 py-0">
                              {m.outcome}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                  Attendance History
                </CardTitle>
                <span className="text-[10px] text-slate-500">{attendanceData.length} record{attendanceData.length !== 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {attendanceLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                </div>
              ) : attendanceData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ClipboardCheck className="h-8 w-8 text-slate-600 mb-2" strokeWidth={1} />
                  <p className="text-xs text-slate-500">No attendance records yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {attendanceData.map((record: any) => {
                    const calendarDate = record.date
                      ? record.date.split('T')[0]
                      : null;
                    return (
                      <div
                        key={record._id}
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 border border-white/[0.05] group hover:bg-white/[0.05] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {calendarDate ? formatDate(calendarDate, gym?.timezone) : '—'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-violet-400" strokeWidth={1.5} />
                            Marked at {formatDateTime(record.markedAt, gym?.timezone)}
                          </p>
                          {record.note && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[200px]">
                              "{record.note}"
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:bg-rose-500/10"
                          title="Undo this attendance mark"
                          disabled={undoAttendanceMutation.isPending}
                          onClick={() => {
                            if (calendarDate && confirm('Remove this attendance record?')) {
                              undoAttendanceMutation.mutate(calendarDate);
                            }
                          }}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card className="border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-200">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No payment history</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{formatMoney(p.amount, gym?.currency)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(p.paymentDate, gym?.timezone)} · <span className="uppercase font-semibold text-[8px] bg-slate-800 px-1 py-0.5 rounded text-slate-300">{p.method}</span>
                        </p>
                      </div>
                      {p.notes && <span className="text-[10px] text-slate-500 italic truncate max-w-[150px]">{p.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={showPayDialog} onOpenChange={(v) => { if (!v) setShowPayDialog(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment against the current active membership</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            recordPaymentMutation.mutate({
              memberId: member._id,
              planId: currentMembership.plan?._id,
              membershipId: currentMembership._id,
              amount: Number(fd.get('amount')),
              method: fd.get('method'),
              paymentDate: fd.get('paymentDate') || new Date().toISOString(),
              notes: fd.get('notes') || '',
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                name="amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                defaultValue={currentMembership ? currentMembership.balanceDue : 0}
              />
            </div>
            <div className="space-y-2">
              <Label>Method *</Label>
              <select name="method" required className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input name="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input name="notes" placeholder="Remarks..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPayDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Renew / Upgrade Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={(v) => { if (!v) setShowRenewDialog(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew / Upgrade Membership</DialogTitle>
            <DialogDescription>Create a new membership period for this member</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            renewMutation.mutate({
              memberId: member._id,
              planId: fd.get('planId'),
              amount: Number(fd.get('amount')),
              method: fd.get('method'),
              startDate: fd.get('startDate') || undefined,
              notes: fd.get('notes') || '',
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Membership Plan *</Label>
              <select name="planId" required className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                <option value="">Select plan</option>
                {plans.filter((p: any) => p.isActive).map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {formatMoney(p.price, gym?.currency)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input name="amount" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select name="method" required className="flex h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input name="notes" placeholder="Remarks..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRenewDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={renewMutation.isPending}>
                {renewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
