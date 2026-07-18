import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, Plus, Edit2, Key, Trash2, Search, 
  Loader2, Dumbbell, ShieldAlert, Phone, Mail, MapPin 
} from 'lucide-react';

// Form validation schemas
const createOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gymName: z.string().min(2, 'Gym name must be at least 2 characters'),
});

const editOwnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  gymName: z.string().min(2, 'Gym name must be at least 2 characters'),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
type EditOwnerInput = z.infer<typeof editOwnerSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function SuperadminOwnersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  // Fetch owners
  const { data: owners, isLoading } = useQuery({
    queryKey: ['superadmin', 'owners'],
    queryFn: async () => {
      const res = await api.get('/superadmin/owners');
      return res.data.data;
    },
  });

  // Forms
  const createForm = useForm<CreateOwnerInput>({
    resolver: zodResolver(createOwnerSchema),
  });

  const editForm = useForm<EditOwnerInput>({
    resolver: zodResolver(editOwnerSchema),
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateOwnerInput) => api.post('/superadmin/owners', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'owners'] });
      toast({ title: 'Owner created successfully', variant: 'success' as any });
      setAddOpen(false);
      createForm.reset();
    },
    onError: (err: any) => {
      toast({ 
        title: 'Failed to create owner', 
        description: err.response?.data?.message || 'Something went wrong', 
        variant: 'destructive' 
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: EditOwnerInput) => api.put(`/superadmin/owners/${selectedOwner?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'owners'] });
      toast({ title: 'Owner details updated successfully', variant: 'success' as any });
      setEditOpen(false);
    },
    onError: (err: any) => {
      toast({ 
        title: 'Failed to update owner', 
        description: err.response?.data?.message || 'Something went wrong', 
        variant: 'destructive' 
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => 
      api.post(`/superadmin/owners/${selectedOwner?._id}/change-password`, data),
    onSuccess: () => {
      toast({ title: "Owner's password updated successfully", variant: 'success' as any });
      setResetOpen(false);
      resetForm.reset();
    },
    onError: (err: any) => {
      toast({ 
        title: 'Failed to update password', 
        description: err.response?.data?.message || 'Something went wrong', 
        variant: 'destructive' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/superadmin/owners/${selectedOwner?._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'owners'] });
      toast({ title: 'Owner and gym deleted successfully', variant: 'success' as any });
      setDeleteOpen(false);
    },
    onError: (err: any) => {
      toast({ 
        title: 'Failed to delete owner', 
        description: err.response?.data?.message || 'Something went wrong', 
        variant: 'destructive' 
      });
    },
  });

  const handleEditClick = (owner: any) => {
    setSelectedOwner(owner);
    editForm.reset({
      name: owner.name,
      phone: owner.phone || '',
      gymName: owner.gym?.name || '',
    });
    setEditOpen(true);
  };

  const handleResetClick = (owner: any) => {
    setSelectedOwner(owner);
    resetForm.reset();
    setResetOpen(true);
  };

  const handleDeleteClick = (owner: any) => {
    setSelectedOwner(owner);
    setDeleteOpen(true);
  };

  // Filter owners list
  const filteredOwners = owners?.filter((o: any) => {
    const query = searchTerm.toLowerCase();
    return (
      o.name.toLowerCase().includes(query) ||
      o.email.toLowerCase().includes(query) ||
      (o.gym?.name && o.gym.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gym Owners</h1>
          <p className="text-sm text-muted-foreground">Manage gym owners, their subscriptions, and credentials.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Gym Owner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Owners</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : owners?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gyms</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? '...' : owners?.filter((o: any) => o.gym).length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Portal Status</p>
              <h3 className="text-lg font-bold text-amber-400">Super Administrator</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List */}
      <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader className="pb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Registered Gyms & Owners</CardTitle>
            <CardDescription>A list of all users registered as gym owners.</CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by owner or gym..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/30"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredOwners || filteredOwners.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No owners found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-medium">
                    <th className="py-3 px-4">Owner Name</th>
                    <th className="py-3 px-4">Gym Details</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOwners.map((owner: any) => (
                    <tr key={owner._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">
                            {owner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p>{owner.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(owner.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {owner.gym ? (
                          <div>
                            <p className="font-semibold text-primary">{owner.gym.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {owner.gym.address || 'No address set'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-red-400">No Gym Configured</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs space-y-1">
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 text-violet-400" />
                          {owner.email}
                        </p>
                        {owner.phone && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-violet-400" />
                            {owner.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(owner)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit Details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetClick(owner)}
                            className="h-8 w-8 text-muted-foreground hover:text-amber-400"
                            title="Change Password"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(owner)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                            title="Delete Owner"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Add Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Add Gym Owner</DialogTitle>
            <DialogDescription>Create a new gym owner account and allocate a new gym.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Owner Full Name</Label>
                <Input id="create-name" placeholder="Shivam Yadav" {...createForm.register('name')} />
                {createForm.formState.errors.name && <p className="text-xs text-red-400">{createForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Owner Email</Label>
                <Input id="create-email" type="email" placeholder="owner@example.com" {...createForm.register('email')} />
                {createForm.formState.errors.email && <p className="text-xs text-red-400">{createForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone Number</Label>
                <Input id="create-phone" placeholder="9876543210" {...createForm.register('phone')} />
                {createForm.formState.errors.phone && <p className="text-xs text-red-400">{createForm.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Initial Password</Label>
                <Input id="create-password" type="password" placeholder="••••••••" {...createForm.register('password')} />
                {createForm.formState.errors.password && <p className="text-xs text-red-400">{createForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-gymName">Gym Name</Label>
                <Input id="create-gymName" placeholder="Iron Paradise Gym" {...createForm.register('gymName')} />
                {createForm.formState.errors.gymName && <p className="text-xs text-red-400">{createForm.formState.errors.gymName.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Owner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Owner Details</DialogTitle>
            <DialogDescription>Modify details for owner {selectedOwner?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit((data) => editMutation.mutate(data))}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Owner Full Name</Label>
                <Input id="edit-name" {...editForm.register('name')} />
                {editForm.formState.errors.name && <p className="text-xs text-red-400">{editForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" {...editForm.register('phone')} />
                {editForm.formState.errors.phone && <p className="text-xs text-red-400">{editForm.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gymName">Gym Name</Label>
                <Input id="edit-gymName" {...editForm.register('gymName')} />
                {editForm.formState.errors.gymName && <p className="text-xs text-red-400">{editForm.formState.errors.gymName.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Directly set a new password for owner <strong>{selectedOwner?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password</Label>
                <Input id="reset-password" type="password" placeholder="••••••••" {...resetForm.register('password')} />
                {resetForm.formState.errors.password && <p className="text-xs text-red-400">{resetForm.formState.errors.password.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={resetMutation.isPending}>
                {resetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Owner Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete owner <strong>{selectedOwner?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground space-y-2">
            <p className="text-red-400/90 font-medium">⚠️ Warning: This is a destructive cascade delete.</p>
            <p>This action will permanently delete:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Owner user account</li>
              <li>The Gym profile (<strong>{selectedOwner?.gym?.name}</strong>)</li>
              <li>All registered gym members and their memberships</li>
              <li>All membership plans and recorded payments</li>
              <li>All gym events and registrations</li>
            </ul>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
