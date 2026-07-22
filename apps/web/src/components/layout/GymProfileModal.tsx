import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { MapPin, Phone, Mail, Dumbbell, Loader2, Settings, KeyRound, Shield, User, ChevronRight, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/utils';

export function GymProfileModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { gym, user, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperadmin = user?.role === 'superadmin';

  // Fetch active plans to show in the profile (only for normal gym owners)
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans', 'active'],
    queryFn: async () => {
      const res = await api.get('/plans');
      return res.data.data.filter((p: any) => p.isActive);
    },
    enabled: open && !isSuperadmin
  });

  const handleEditClick = () => {
    onOpenChange(false);
    navigate('/settings');
  };

  const handleChangePasswordClick = () => {
    onOpenChange(false);
    navigate('/change-password');
  };

  const handleLogoutClick = async () => {
    onOpenChange(false);
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {isSuperadmin ? (
          <>
            <DialogHeader className="flex flex-col items-center text-center sm:text-center space-y-4">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-amber-600/10 border-2 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center text-amber-400">
                <Shield className="h-10 w-10" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-amber-400">Superadmin Portal</DialogTitle>
                <DialogDescription className="mt-1">
                  Global System Administrator
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Admin Name:</span>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Email Address:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Role:</span>
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30">
                    Superadmin
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleChangePasswordClick} variant="outline" className="flex-1 gap-2">
                  <KeyRound className="h-4 w-4" strokeWidth={1.5} />
                  Password
                </Button>
                <Button onClick={handleLogoutClick} variant="destructive" className="flex-1 gap-2 bg-rose-600 hover:bg-rose-500 text-white border-none">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="flex flex-col items-center text-center sm:text-center space-y-4">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-secondary/50 border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center">
                {gym?.logo ? (
                  <img src={gym.logo} alt={gym.name} className="h-full w-full object-cover" />
                ) : (
                  <Dumbbell className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold gradient-text">{gym?.name || 'My Gym'}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center justify-center gap-1 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> {gym?.address || 'No address provided'}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex flex-col gap-3 text-sm border-y border-white/5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-4 w-4 text-emerald-400" /> Owner:</span>
                  <span className="font-semibold text-foreground">{user.name}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {gym?.contactNumber && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" /> {gym.contactNumber}
                    </div>
                  )}
                  {gym?.email && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-slate-300">
                      <Mail className="h-3.5 w-3.5 text-emerald-400" /> {gym.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">Available Memberships</h4>
                {isLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : plansData?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active plans</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {plansData?.map((plan: any) => (
                      <div 
                        key={plan._id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-l-2 hover:border-l-emerald-400 transition-all duration-200 group cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-sm text-foreground">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.durationInDays || plan.durationMonths * 30} days</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {formatMoney(plan.price, gym?.currency || 'INR')}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex gap-3">
                  <Button onClick={handleEditClick} variant="outline" className="flex-1 gap-2">
                    <Settings className="h-4 w-4" strokeWidth={1.5} />
                    Edit Profile
                  </Button>
                  <Button onClick={handleChangePasswordClick} variant="outline" className="flex-1 gap-2">
                    <KeyRound className="h-4 w-4" strokeWidth={1.5} />
                    Password
                  </Button>
                </div>
                <Button onClick={handleLogoutClick} variant="destructive" className="w-full gap-2 bg-rose-600 hover:bg-rose-500 text-white border-none">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
