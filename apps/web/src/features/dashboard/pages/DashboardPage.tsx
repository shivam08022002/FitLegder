import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatMoney, formatDate, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Users, UserPlus, CreditCard, TrendingUp, AlertCircle,
  AlertTriangle, Clock, ArrowRight, Loader2, CalendarDays, Plus,
  HelpCircle, BookOpen, FileText, RefreshCw, BarChart3, Settings, LayoutDashboard
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 page-enter">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const stats = data || {
    totalMembers: 0, activeMembers: 0, expiringSoon: 0,
    expired: 0, todayRevenue: 0, monthlyRevenue: 0,
    recentPayments: [], recentRegistrations: [],
  };

  const isNewMember = (createdAtStr: string) => {
    try {
      const created = new Date(createdAtStr);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours <= 24;
    } catch {
      return false;
    }
  };

  const guideItems = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      desc: 'Your central control tower.',
      points: [
        'Monitor active member counts and live revenue metrics.',
        'Quickly access recent payment receipts and new signups.',
        'Use quick action buttons to register members or log payments instantly.'
      ],
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      icon: CalendarDays,
      title: 'Events',
      desc: 'Host tournaments, bootcamps, and sessions.',
      points: [
        'Create public events with custom entry fees and banners.',
        'Upload payment QR codes & UPI IDs for automatic registration copies.',
        'Verify payments on the bell notification panel before final check-in.'
      ],
      color: 'text-pink-400 bg-pink-500/10'
    },
    {
      icon: Users,
      title: 'Members',
      desc: 'Track member profiles and attendance.',
      points: [
        'Add member details, gender, emergency contacts, and joining dates.',
        'Click "Mark Attendance" on member rows to record daily check-ins.',
        'View complete plan logs and payment histories inside details.'
      ],
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      icon: FileText,
      title: 'Plans',
      desc: 'Configure subscription packages.',
      points: [
        'Define durations (days/months) and pricing tiers.',
        'Activate or deactivate plans to structure membership offerings.',
        'Plans link dynamically to member registrations and calculations.'
      ],
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      icon: CreditCard,
      title: 'Payments',
      desc: 'Log cash and digital transactions.',
      points: [
        'Record manual plan payments and partial payments.',
        'Track "Due Balances" for members with outstanding fees.',
        'Generate printable PDF invoice receipts for members immediately.'
      ],
      color: 'text-teal-400 bg-teal-500/10'
    },
    {
      icon: RefreshCw,
      title: 'Renewals',
      desc: 'Resubscribe expired accounts.',
      points: [
        'View list of expired member plans.',
        'Quick-renew memberships with a single action, creating a new billing log.',
        'Maintains membership history for continuous records.'
      ],
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      icon: Clock,
      title: 'Expiry',
      desc: 'Prevent plan drop-offs.',
      points: [
        'Proactively track member packages expiring in the next 7 days.',
        'Provides member details and contacts to reach out prior to plan lapse.'
      ],
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      icon: BarChart3,
      title: 'Reports',
      desc: 'Data-driven business analysis.',
      points: [
        'Track monthly revenue and signup counts in beautiful charts.',
        'All calculations are timezone-adjusted to gym settings.',
        'Analyze true renewal percentages and active membership metrics.'
      ],
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      icon: Settings,
      title: 'Settings',
      desc: 'Customize gym configurations.',
      points: [
        'Upload your gym logo, update contacts, and select currency symbols.',
        'Set your gym timezone to align report calculations.'
      ],
      color: 'text-slate-400 bg-slate-500/10'
    }
  ];

  return (
    <div className="space-y-5 md:space-y-8 page-enter stagger-children">
      {/* Header Area */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold md:text-3xl truncate">
            Welcome back, <span className="gradient-text font-extrabold">{gym?.name || 'My Gym'}</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm truncate">Here's what's happening today</p>
        </div>
        <Button
          onClick={() => setHelpOpen(true)}
          variant="outline"
          className="rounded-xl border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 gap-1.5 h-8.5 px-3 sm:h-9 sm:px-4 text-xs font-semibold shrink-0"
        >
          <HelpCircle className="h-4 w-4" />
          <span>How it works</span>
        </Button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2 w-full sm:inline-flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2 sm:rounded-full border border-white/5 bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-2 sm:p-1.5 rounded-2xl shadow-lg shadow-black/10">
        <Button 
          onClick={() => navigate('/members?action=add')} 
          className="rounded-xl sm:rounded-full gap-1.5 h-10 sm:h-9 text-xs justify-center w-full sm:w-auto"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add Member
        </Button>
        <Button 
          onClick={() => navigate('/events')} 
          variant="secondary"
          className="rounded-xl sm:rounded-full gap-1.5 h-10 sm:h-9 text-xs justify-center hover:bg-white/10 w-full sm:w-auto"
        >
          <CalendarDays className="h-3.5 w-3.5 text-pink-400" strokeWidth={1.5} /> Add Event
        </Button>
        <Button 
          onClick={() => navigate('/payments?action=record')} 
          variant="secondary"
          className="rounded-xl sm:rounded-full gap-1.5 h-10 sm:h-9 text-xs justify-center hover:bg-white/10 w-full sm:w-auto"
        >
          <CreditCard className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} /> Record Payment
        </Button>
        <Button 
          onClick={() => navigate('/expiry')} 
          variant="secondary"
          className="rounded-xl sm:rounded-full gap-1.5 h-10 sm:h-9 text-xs justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 w-full sm:w-auto"
        >
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} /> View Expiring
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
        {/* Total Members */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Total Members</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{stats.totalMembers}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Users className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Active</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{stats.activeMembers}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <UserPlus className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className={cn(
          "relative overflow-hidden group transition-all duration-300", 
          stats.expiringSoon > 0 ? "border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.08)]" : ""
        )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Expiring Soon</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{stats.expiringSoon}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <AlertCircle className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expired */}
        <Card className={cn(
          "relative overflow-hidden group transition-all duration-300", 
          stats.expired > 0 ? "border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.08)]" : ""
        )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Expired</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{stats.expired}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <Clock className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Today's Revenue</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{formatMoney(stats.todayRevenue, gym?.currency)}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <CreditCard className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="relative overflow-hidden group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-medium truncate">Monthly Revenue</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 sm:mt-2.5 tabular-nums">{formatMoney(stats.monthlyRevenue, gym?.currency)}</h3>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 sm:p-6 sm:pb-3">
            <CardTitle className="text-base font-bold text-slate-200">Recent Payments</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/payments')} 
              className="text-xs gap-1 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 hover:translate-x-1 transition-all duration-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            {stats.recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <CreditCard className="h-10 w-10 opacity-30 mb-2" strokeWidth={1.5} />
                <p className="text-sm">No payments yet · First one coming soon?</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentPayments.slice(0, 5).map((payment: any) => (
                  <div 
                    key={payment._id} 
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-white/[0.08] hover:translate-x-1 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-[10px] sm:text-xs font-bold text-slate-950 shadow-md">
                        {payment.member?.fullName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{payment.member?.fullName || 'Unknown'}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                          {formatDate(payment.paymentDate, gym?.timezone)} · <span className="uppercase font-medium text-[9px] sm:text-[10px] bg-slate-800 px-1 sm:px-1.5 py-0.5 rounded">{payment.method}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 group-hover:scale-105 transition-transform duration-300 shrink-0 ml-2">
                      +{formatMoney(payment.amount, gym?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="p-1">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 sm:p-6 sm:pb-3">
            <CardTitle className="text-base font-bold text-slate-200">Recent Members</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/members')} 
              className="text-xs gap-1 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 hover:translate-x-1 transition-all duration-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            {stats.recentRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Users className="h-10 w-10 opacity-30 mb-2" strokeWidth={1.5} />
                <p className="text-sm">No members yet · First one coming soon?</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentRegistrations.slice(0, 5).map((member: any) => (
                  <div 
                    key={member._id} 
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-2.5 py-2 sm:px-4 sm:py-3 hover:bg-white/[0.08] hover:translate-x-1 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-[10px] sm:text-xs font-bold text-slate-950 shadow-md">
                        {member.fullName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{member.fullName}</p>
                          {isNewMember(member.createdAt) && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] sm:text-[9px] px-1 py-0 h-4 flex items-center">New</Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{member.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0 ml-2">
                      {formatDate(member.joiningDate, gym?.timezone)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How it Works Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-3xl bg-slate-950/95 border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col p-6 text-slate-100">
          <DialogHeader className="border-b border-white/5 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <DialogTitle className="text-xl font-bold text-white">How GymArchive Works</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-sm">
              An overview guide on using every page in your gym SaaS dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1 mt-4 custom-scrollbar">
            <div className="grid gap-4 sm:grid-cols-2">
              {guideItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors flex gap-3.5">
                  <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-inner", item.color)}>
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                    <ul className="list-disc pl-3 text-[10px] text-slate-500 space-y-1 mt-2">
                      {item.points.map((p, pIdx) => (
                        <li key={pIdx} className="leading-snug">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
