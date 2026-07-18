import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema, type CreateMemberInput } from '@gym-saas/validation';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatDate, formatMoney, getMembershipStatus, getStatusLabel, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  UserPlus, Search, Loader2, Phone,
  Mail, Calendar, Trash2, Edit, Eye, Dumbbell, ChevronRight,
  UserCheck, CheckCheck, User, MapPin, CreditCard
} from 'lucide-react';

export default function MembersPage() {
  const { gym, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showAddDialog, setShowAddDialog] = useState(searchParams.get('action') === 'add');
  const [editMember, setEditMember] = useState<any>(null);
  const [markingMember, setMarkingMember] = useState<any>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, page],
    queryFn: async () => {
      const res = await api.get('/members', {
        params: { search: search || undefined, page, limit: 20 },
      });
      return res.data;
    },
  });

  // Fetch the set of memberIds already marked present today (single call, not per-member)
  const { data: todayData } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: async () => {
      const res = await api.get('/members/attendance/today-summary');
      return new Set<string>(res.data.data as string[]);
    },
    staleTime: 60 * 1000, // 1 min — refresh is triggered by invalidation on mark
  });
  const markedToday = todayData ?? new Set<string>();

  const markAttendanceMutation = useMutation({
    mutationFn: ({ memberId, date, note }: { memberId: string; date?: string; note?: string }) =>
      api.post(`/members/${memberId}/attendance`, { date, note }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['member-attendance', vars.memberId] });
      setMarkingMember(null);
      toast({ title: 'Attendance marked ✓', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to mark attendance',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMemberInput) => api.post('/members', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAddDialog(false);
      toast({ title: 'Member added', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to add member', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setEditMember(null);
      toast({ title: 'Member updated', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Member deleted', variant: 'success' as any });
    },
  });

  const members = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-slate-400">{pagination.total} total members configured</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 self-start shrink-0">
          <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Add Member
        </Button>
      </div>

      {/* Toolbar / Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={1.5} />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      {/* Member List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : members.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Dumbbell className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">No members found</p>
            <p className="text-sm text-slate-400 mb-6">Get started by adding your first gym member</p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Add Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member: any) => {
            const status = member.membershipStatus || getMembershipStatus(member.latestMembership?.endDate);
            return (
              <Card 
                key={member._id} 
                className="overflow-hidden border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl hover:translate-x-1 duration-300 hover:border-violet-500/20 group"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                      {member.fullName?.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-200 truncate">{member.fullName}</p>
                        <Badge variant={status as any} className="text-[10px] px-2 py-0.5 rounded-full">{getStatusLabel(status)}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.5} /> {member.phone}</span>
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.5} /> {member.email}
                          </span>
                        )}
                      </div>
                      {/* Mobile Only: Inline plan & expiry info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-2 sm:hidden border-t border-white/5 pt-2">
                        {member.latestMembership?.planDetails?.name && (
                          <span className="font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded">{member.latestMembership.planDetails.name}</span>
                        )}
                        {member.latestMembership?.endDate && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-violet-400" strokeWidth={1.5} /> Exp: {formatDate(member.latestMembership.endDate, gym?.timezone)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right pr-4 shrink-0">
                    {member.latestMembership?.planDetails?.name && (
                      <p className="text-xs font-semibold text-slate-300">{member.latestMembership.planDetails.name}</p>
                    )}
                    {member.latestMembership?.endDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                        <Calendar className="h-3 w-3 text-violet-400" strokeWidth={1.5} /> Exp: {formatDate(member.latestMembership.endDate, gym?.timezone)}
                      </p>
                    )}
                  </div>

                  {/* Action items */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 shrink-0">
                    <div className="flex items-center gap-1">
                      {/* Mark Present — owner only */}
                      {user?.role === 'owner' && (
                        markedToday.has(member._id) ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="h-8 gap-1.5 rounded-full px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold cursor-default"
                          >
                            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                            Present
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full px-3 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 text-[11px] font-semibold"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setMarkingMember(member); }}
                          >
                            <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Mark Attendance
                          </Button>
                        )
                      )}
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10" 
                        onClick={() => navigate(`/members/${member._id}`)}
                      >
                        <Eye className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10" 
                        onClick={() => setEditMember(member)}
                      >
                        <Edit className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10" 
                        onClick={() => { if (confirm('Delete this member?')) deleteMutation.mutate(member._id); }}
                      >
                        <Trash2 className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                      </Button>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform shrink-0 hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl">Previous</Button>
              <span className="text-xs text-slate-400">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded-xl">Next</Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Member Dialog */}
      <MemberFormDialog
        open={showAddDialog || !!editMember}
        onClose={() => { setShowAddDialog(false); setEditMember(null); }}
        member={editMember}
        onSubmit={(data) => {
          if (editMember) {
            updateMutation.mutate({ id: editMember._id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Mark Attendance Dialog */}
      <MarkAttendanceDialog
        member={markingMember}
        gym={gym}
        open={!!markingMember}
        onClose={() => setMarkingMember(null)}
        onConfirm={(date, note) =>
          markAttendanceMutation.mutate({ memberId: markingMember._id, date, note })
        }
        isLoading={markAttendanceMutation.isPending}
      />
    </div>
  );
}

function MarkAttendanceDialog({
  open,
  onClose,
  member,
  gym,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  member: any;
  gym: any;
  onConfirm: (date?: string, note?: string) => void;
  isLoading: boolean;
}) {
  const tz = gym?.timezone ?? 'Asia/Kolkata';
  const todayStr: string = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  const minDate = (() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  })();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [note, setNote] = useState('');

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedDate(todayStr);
      setNote('');
    }
  }, [open, todayStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedDate !== todayStr ? selectedDate : undefined, note || undefined);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 border border-violet-500/20">
              <UserCheck className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
            </span>
            Mark Present
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Recording attendance for{' '}
            <span className="font-semibold text-slate-200">{member?.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Date</Label>
            <Input
              type="date"
              value={selectedDate}
              max={todayStr}
              min={minDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl"
            />
            {selectedDate !== todayStr && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                Backfilling past date — timestamp will reflect now
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">
              Note <span className="text-slate-600 normal-case">(optional)</span>
            </Label>
            <Input
              placeholder='e.g. "Backfilled — forgot yesterday"'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl gap-2 shadow-lg shadow-violet-500/20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="h-4 w-4" strokeWidth={2} />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberFormDialog({ open, onClose, member, onSubmit, isLoading }: {
  open: boolean;
  onClose: () => void;
  member: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: member ? {
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || '',
      address: member.address || '',
      gender: member.gender,
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
      joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: member.notes || '',
    } : {
      joiningDate: new Date().toISOString().split('T')[0],
      gender: 'male' as const,
      paymentMethod: 'cash' as const,
    },
  });

  useEffect(() => {
    if (member) {
      reset({
        fullName: member.fullName,
        phone: member.phone,
        email: member.email || '',
        address: member.address || '',
        gender: member.gender,
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
        joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: member.notes || '',
      });
    } else {
      reset({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        gender: 'male' as const,
        dateOfBirth: '',
        joiningDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [member, reset, open]);

  const { data: plansData } = useQuery({
    queryKey: ['plans', 'active'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data.data.filter((p: any) => p.isActive);
    },
    enabled: open && !member,
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = plansData?.find((p: any) => p._id === selectedPlanId);

  if (selectedPlanId && selectedPlan && watch('amountPaid') === undefined) {
    setValue('amountPaid', selectedPlan.price);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{member ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">{member ? 'Update member details' : 'Fill in the details to add a new member'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
              <User className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Full Name *</Label>
                <div className="relative">
                  <Input id="fullName" {...register('fullName')} placeholder="Enter Full Name" className="pl-9" />
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                </div>
                {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Phone *</Label>
                <div className="relative">
                  <Input id="phone" {...register('phone')} placeholder="Enter Phone" className="pl-9" />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                </div>
                {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Email</Label>
                <div className="relative">
                  <Input id="email" type="email" {...register('email')} placeholder="Enter Email Address" className="pl-9" />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Gender *</Label>
                <select {...register('gender')} className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-400">{errors.gender.message}</p>}
              </div>
            </div>
          </div>

          {/* Membership Timing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
              <Calendar className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Important Dates</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Joining Date *</Label>
                <Input id="joiningDate" type="date" {...register('joiningDate')} />
                {errors.joiningDate && <p className="text-xs text-red-400">{errors.joiningDate.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-400">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                {errors.dateOfBirth && <p className="text-xs text-red-400">{errors.dateOfBirth.message}</p>}
              </div>
            </div>
          </div>

          {/* Initial Membership & Payment (Add Mode only) */}
          {!member && (
            <div className="space-y-4 bg-violet-500/5 p-4 rounded-2xl border border-violet-500/10">
              <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                <CreditCard className="h-4 w-4 text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Initial Membership & Payment</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-400">Select Plan (Optional)</Label>
                  <select {...register('planId')} className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500">
                    <option value="">No plan initially</option>
                    {plansData?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                    ))}
                  </select>
                </div>
                {selectedPlanId && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-400">Amount Paid Now</Label>
                    <Input id="amountPaid" type="number" {...register('amountPaid', { valueAsNumber: true })} />
                    {errors.amountPaid && <p className="text-xs text-red-400">{errors.amountPaid.message}</p>}
                  </div>
                )}
              </div>
              {selectedPlanId && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-400">Payment Method</Label>
                  <select {...register('paymentMethod')} className="flex h-10 w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Additional Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
              <MapPin className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Additional Details</h3>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-400">Address</Label>
              <div className="relative">
                <Input id="address" {...register('address')} placeholder="Enter Address" className="pl-9" />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              </div>
              {errors.address && <p className="text-xs text-red-400">{errors.address.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-400">Notes</Label>
              <Textarea id="notes" rows={2} {...register('notes')} placeholder="Enter notes or health conditions..." />
              {errors.notes && <p className="text-xs text-red-400">{errors.notes.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl shimmer-btn px-6">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : member ? 'Update Member' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
