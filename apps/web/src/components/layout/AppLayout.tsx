import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GymProfileModal } from './GymProfileModal';
import fitledgerLockup from '@/Assets/fitledger_lockup_columnweights.svg';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { RegistrationsNotificationDialog } from './RegistrationsNotificationDialog';
import {
  LayoutDashboard, Users, CreditCard, RefreshCw, Clock,
  BarChart3, Settings, LogOut, Dumbbell, ChevronLeft,
  ChevronRight, Menu, X, FileText, CalendarDays, KeyRound, Shield, Bell, ClipboardCheck
} from 'lucide-react';

export default function AppLayout() {
  const { user, gym, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  const isSuperadmin = user?.role === 'superadmin';

  const { data: pendingCount } = useQuery({
    queryKey: ['pendingRegistrationsCount'],
    queryFn: async () => {
      const res = await api.get('/events/registrations/pending');
      return res.data.data.length;
    },
    enabled: !isSuperadmin && !!user,
    staleTime: Infinity, // Call once on login/mount, no automatic polling!
  });

  const currentNavItems = isSuperadmin
    ? [
      { to: '/', icon: Users, label: 'Owners' },
      { to: '/verification-queue', icon: ClipboardCheck, label: 'Verification Queue' },
      { to: '/saas-settings', icon: Shield, label: 'SaaS Settings' },
      { to: '/change-password', icon: KeyRound, label: 'Change Password' },
    ]
    : [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/events', icon: CalendarDays, label: 'Events' },
      { to: '/members', icon: Users, label: 'Members' },
      { to: '/plans', icon: FileText, label: 'Plans' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
      { to: '/renewals', icon: RefreshCw, label: 'Renewals' },
      { to: '/expiry', icon: Clock, label: 'Expiry' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/change-password', icon: KeyRound, label: 'Change Password' },
    ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-all duration-300 lg:relative',
          collapsed ? 'w-20' : 'w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-25 flex-col justify-center border-b border-border px-2 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center min-w-0 cursor-pointer">
              <img
                src={fitledgerLockup}
                alt="GymArchive"
                className={cn(
                  "object-contain transition-all duration-300",
                  collapsed ? "h-12 w-12" : "h-13 pl-1"
                )}
              />
            </Link>
            {/* Mobile close */}
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          {!collapsed && (
            <p className="text-[14px] text-muted-foreground truncate pl-4 mt-0.5 font-medium">
              {isSuperadmin ? 'Admin Portal' : gym?.name || 'My Gym'}
            </p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 group border-l-4',
                  isActive
                    ? 'border-violet-600 bg-white/5 text-white shadow-sm'
                    : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )
              }
            >
              <item.icon className={cn('h-5 w-5 shrink-0 transition-colors group-hover:text-foreground', collapsed && 'mx-auto')} strokeWidth={1.5} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && !isSuperadmin && gym && (
            <Link 
              to="/subscription" 
              onClick={() => setMobileOpen(false)} 
              className="block w-full group focus-visible:outline-none"
            >
              <div className="flex flex-col gap-1.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/15 border border-violet-500/20 hover:border-violet-500/40 p-3 transition-all duration-300 text-left shadow-lg shadow-violet-500/5 hover:shadow-violet-500/10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">SaaS License</span>
                  <span className={cn(
                    "text-[9px] font-semibold px-2 py-0.5 rounded-full border",
                    gym.subscriptionPlan === 'free_trial'
                      ? (Math.max(0, Math.ceil((new Date(gym.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) === 0
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-violet-500/20 text-violet-300 border-violet-500/30")
                      : gym.subscriptionStatus === 'pending_approval'
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  )}>
                    {gym.subscriptionPlan === 'free_trial' 
                      ? 'Free Trial' 
                      : gym.subscriptionStatus === 'pending_approval' 
                        ? 'Pending Approval' 
                        : 'Active'}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {gym.subscriptionPlan === 'free_trial' 
                      ? (() => {
                          const expiresAt = gym.subscriptionExpiresAt ? new Date(gym.subscriptionExpiresAt).getTime() : 0;
                          const days = Math.max(0, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
                          return days === 0 ? 'Trial Expired' : `${days} Days Left`;
                        })()
                      : gym.subscriptionPlan === 'tier1'
                        ? 'Starter Plan'
                        : gym.subscriptionPlan === 'tier2'
                          ? 'Growth Plan'
                          : 'Enterprise Plan'}
                  </span>
                  <span className="text-[11px] bg-violet-600 hover:bg-violet-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors group-hover:scale-105 transform duration-300 flex items-center shadow-md shadow-violet-600/25 shrink-0">
                    Upgrade
                  </span>
                </div>
              </div>
            </Link>
          )}

          {!collapsed && isSuperadmin && (
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 rounded-xl transition-all duration-300 font-semibold text-slate-400 md:hover:text-rose-400 md:hover:bg-rose-500/10 border border-transparent md:hover:border-rose-500/20 shadow-sm',
              collapsed ? 'justify-center px-0' : 'px-3.5 py-2.5'
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Sign Out'}
          </Button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center rounded-lg py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Global header */}
        <header className="sticky top-0 z-30 flex h-20 py-2 lg:py-4 items-center justify-between border-b border-border bg-background/75 backdrop-blur-md px-4 lg:px-8 transition-all">
          <div className="flex items-center gap-0">
            <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center lg:hidden cursor-pointer">
              <img src={fitledgerLockup} alt="GymArchive" className="h-12 object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {!isSuperadmin && (
              <>
                <button
                  onClick={() => setNotiOpen(true)}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
                >
                  <Bell className="h-5 w-5" strokeWidth={1.5} />
                  {pendingCount !== undefined && pendingCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 ring-1 ring-background" />
                  )}
                </button>
                <RegistrationsNotificationDialog open={notiOpen} onOpenChange={setNotiOpen} />
              </>
            )}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full overflow-hidden bg-secondary border border-border hover:opacity-80 transition-opacity"
            >
              {isSuperadmin ? (
                <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-amber-400" />
              ) : gym?.logo ? (
                <img src={gym.logo} alt={gym.name} className="h-full w-full object-cover" />
              ) : (
                <Dumbbell className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground" />
              )}
            </button>
          </div>
        </header>

        <GymProfileModal open={profileOpen} onOpenChange={setProfileOpen} />

        <div className="flex-1 p-4 md:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
