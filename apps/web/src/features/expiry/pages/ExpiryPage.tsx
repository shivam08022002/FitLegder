import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatDate, getMembershipStatus, getStatusLabel, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, AlertTriangle, AlertCircle, XCircle, Phone, Calendar } from 'lucide-react';

const tabs = [
  { key: 'today', label: 'Expiring Today', icon: AlertCircle, color: 'text-orange-400' },
  { key: '3day', label: '3 Days', icon: AlertTriangle, color: 'text-amber-400' },
  { key: '7day', label: '7 Days', icon: Clock, color: 'text-yellow-400' },
  { key: 'expired', label: 'Expired', icon: XCircle, color: 'text-rose-400' },
];

export default function ExpiryPage() {
  const { gym } = useAuth();
  const [activeTab, setActiveTab] = useState('today');

  const getExpiryParams = (tab: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    switch (tab) {
      case 'today': return { expiryFrom: todayStr, expiryTo: todayStr };
      case '3day': {
        const d = new Date(now); d.setDate(d.getDate() + 3);
        return { expiryFrom: todayStr, expiryTo: d.toISOString().split('T')[0] };
      }
      case '7day': {
        const d = new Date(now); d.setDate(d.getDate() + 7);
        return { expiryFrom: todayStr, expiryTo: d.toISOString().split('T')[0] };
      }
      case 'expired': {
        const d = new Date(now); d.setDate(d.getDate() - 1);
        return { expiryTo: d.toISOString().split('T')[0] };
      }
      default: return {};
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['expiry', activeTab],
    queryFn: async () => {
      const params = getExpiryParams(activeTab);
      const res = await api.get('/members', { params: { ...params, limit: 100 } });
      return res.data;
    },
  });

  const members = data?.data || [];

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div>
        <h1 className="text-2xl font-bold">Expiry Management</h1>
        <p className="text-sm text-slate-400 font-medium">Track and reach out to expiring and expired gym members</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-row items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'gap-2 whitespace-nowrap rounded-lg h-9 px-4 text-xs font-semibold transition-all shrink-0',
                !isActive && 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <tab.icon className={cn('h-4 w-4', isActive ? 'text-white' : tab.color)} strokeWidth={1.5} />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : members.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Clock className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-200">No members found</p>
            <p className="text-sm text-slate-400">Great job! All members are secure under this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m: any) => {
            const status = m.membershipStatus || getMembershipStatus(m.latestMembership?.endDate);
            
            // Urgency glow class assignments
            const isExpired = status === 'expired';
            const isCritical = status === 'critical' || activeTab === 'today' || activeTab === '3day';

            return (
              <Card 
                key={m._id} 
                className={cn(
                  "overflow-hidden border-white/[0.06] bg-[rgba(15,23,42,0.5)] backdrop-blur-xl transition-all duration-300",
                  isExpired && "border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.08)]",
                  isCritical && !isExpired && "border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-slate-950 shadow-md">
                    {m.fullName?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-200 truncate">{m.fullName}</p>
                      <Badge variant={status as any} className="text-[10px] px-2 py-0.5 rounded-full">{getStatusLabel(status)}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} /> 
                        {m.phone}
                      </span>
                      {m.latestMembership?.endDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} /> 
                          Expires: {formatDate(m.latestMembership.endDate, gym?.timezone)}
                        </span>
                      )}
                      {m.latestMembership?.planDetails?.name && (
                        <span className="hidden sm:inline font-semibold text-slate-300">{m.latestMembership.planDetails.name}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
