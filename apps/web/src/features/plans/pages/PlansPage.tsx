import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlanSchema, type CreatePlanInput } from '@/validation';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatMoney, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Loader2, FileText, Check, ToggleLeft, ToggleRight, Award } from 'lucide-react';

export default function PlansPage() {
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlanInput) => api.post('/plans', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowAddDialog(false);
      toast({ title: 'Plan created', variant: 'success' as any });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditPlan(null);
      toast({ title: 'Plan updated', variant: 'success' as any });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/plans/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plan deleted', variant: 'success' as any });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 page-enter">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const activePlansCount = plans.filter((p: any) => p.isActive).length;

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membership Plans</h1>
          <p className="text-sm text-slate-400">
            {activePlansCount} plans active · Choose what fits your members
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 shrink-0 shadow-lg shadow-violet-500/20">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03] p-1">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FileText className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">No plans yet</p>
            <p className="text-sm text-slate-400 mb-6">Create your first membership plan to get started</p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
          {plans.map((plan: any) => (            <Card 
              key={plan._id} 
              className={cn(
                'relative overflow-visible group transition-all duration-300 border backdrop-blur-xl hover:translate-y-[-4px] hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]', 
                plan.isActive 
                  ? 'bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.02)]' 
                  : 'bg-rose-500/5 border-rose-500/10 opacity-70'
              )}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                      plan.isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      <Award className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-100 truncate">{plan.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{plan.durationInDays} days duration</p>
                    </div>
                  </div>
                  <Badge variant={plan.isActive ? 'active' : 'expired'} className="shrink-0 shadow-sm text-[9px] px-1.5 py-0">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-3 pb-3 border-b border-white/5">
                  <span className="text-3xl font-extrabold gradient-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{formatMoney(plan.price, gym?.currency)}</span>
                </div>
                {/* Features List */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>Includes perks & merchandise</span>
                  </div>
                  {plan.description && (
                    <div className="flex items-start gap-2 text-xs text-slate-400 italic">
                      <span>{plan.description}</span>
                    </div>
                  )}
                  {(plan.discount > 0 || plan.tax > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {plan.discount > 0 && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          -{plan.discount}% discount
                        </Badge>
                      )}
                      {plan.tax > 0 && (
                        <Badge variant="secondary" className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 font-medium">
                          +{plan.tax}% tax
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => toggleMutation.mutate(plan._id)} 
                    className={cn(
                      "gap-1.5 text-xs rounded-xl px-3",
                      plan.isActive 
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    )}
                  >
                    {plan.isActive ? (
                      <ToggleRight className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft className="h-5 w-5" strokeWidth={1.5} />
                    )}
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10" 
                      onClick={() => setEditPlan(plan)}
                    >
                      <Edit className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.5} />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10" 
                      onClick={() => { if (confirm('Delete this plan?')) deleteMutation.mutate(plan._id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Plan Dialog */}
      <PlanFormDialog
        open={showAddDialog || !!editPlan}
        onClose={() => { setShowAddDialog(false); setEditPlan(null); }}
        plan={editPlan}
        onSubmit={(data: CreatePlanInput) => { 
          editPlan ? updateMutation.mutate({ id: editPlan._id, data }) : createMutation.mutate(data); 
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
        currency={gym?.currency}
      />
    </div>
  );
}

function PlanFormDialog({ open, onClose, plan, onSubmit, isLoading, currency }: any) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: plan 
      ? { name: plan.name, durationInDays: plan.durationInDays, price: plan.price, discount: plan.discount, tax: plan.tax, description: plan.description || '', isActive: plan.isActive } 
      : { isActive: true },
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        durationInDays: plan.durationInDays,
        price: plan.price,
        discount: plan.discount,
        tax: plan.tax,
        description: plan.description || '',
        isActive: plan.isActive
      });
    } else {
      reset({
        name: '',
        durationInDays: undefined,
        price: undefined,
        discount: undefined,
        tax: undefined,
        description: '',
        isActive: true
      });
    }
  }, [plan, reset, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{plan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">Configure your membership plan details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => onSubmit({ 
          ...data, 
          durationInDays: Number(data.durationInDays), 
          price: Number(data.price), 
          discount: data.discount ? Number(data.discount) : undefined, 
          tax: data.tax ? Number(data.tax) : undefined 
        }))} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Plan Name *</Label>
            <Input {...register('name')} placeholder="e.g. Yearly Premium" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Duration (days) *</Label>
              <Input type="number" {...register('durationInDays', { valueAsNumber: true })} placeholder="365" />
              {errors.durationInDays && <p className="text-xs text-red-400">{errors.durationInDays.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Price ({currency || 'INR'}) *</Label>
              <Input type="number" {...register('price', { valueAsNumber: true })} placeholder="6500" />
              {errors.price && <p className="text-xs text-red-400">{errors.price.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Discount (%)</Label>
              <Input type="number" {...register('discount', { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400">Tax (%)</Label>
              <Input type="number" {...register('tax', { valueAsNumber: true })} placeholder="0" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400">Description</Label>
            <Textarea rows={2} {...register('description')} placeholder="e.g. Free t-shirt, towel service, full access" />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl shimmer-btn">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : plan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
