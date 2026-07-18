import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import api from '@/lib/api';
import { formatMoney, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, BarChart3, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const periods = [
  { key: 'day', label: 'Daily' },
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
];

export default function ReportsPage() {
  const { gym } = useAuth();
  const [period, setPeriod] = useState('month');

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['reports-revenue', period],
    queryFn: async () => {
      const res = await api.get('/reports/revenue', { params: { period } });
      return res.data.data;
    },
  });

  const { data: memberData, isLoading: memLoading } = useQuery({
    queryKey: ['reports-members', period],
    queryFn: async () => {
      const res = await api.get('/reports/members', { params: { period } });
      return res.data.data;
    },
  });

  const isLoading = revLoading || memLoading;

  // Custom Glassmorphic Tooltip for Charts
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
          <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm font-bold" style={{ color: item.color || item.fill }}>
              {formatter ? formatter(item.value, item.name) : `${item.name}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 page-enter stagger-children">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-slate-400 font-medium">Revenue and member analytics metrics</p>
        </div>
        
        {/* Period Picker */}
        <div className="inline-flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 shrink-0 w-fit">
          {periods.map((p) => {
            const isActive = period === p.key;
            return (
              <Button 
                key={p.key} 
                variant={isActive ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setPeriod(p.key)} 
                className={cn(
                  'rounded-lg h-9 px-4 text-xs font-semibold transition-all',
                  !isActive && 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {p.label}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{formatMoney(revenueData?.totalRevenue || 0, gym?.currency)}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Total Members</p>
                  <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{memberData?.totalMembers || 0}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <Users className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Active Members</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1.5 tabular-nums">{memberData?.activeMembers || 0}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Users className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Data Points</p>
                  <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{revenueData?.data?.length || 0}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <Database className="h-5 w-5" strokeWidth={1.5} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="p-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-200">
                <TrendingUp className="h-5 w-5 text-emerald-400" strokeWidth={1.5} /> Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!revenueData?.data || revenueData.data.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <BarChart3 className="h-10 w-10 opacity-30 mb-2" strokeWidth={1.5} />
                  <p className="text-sm">No revenue data for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} dx={-8} />
                    <Tooltip content={<CustomTooltip formatter={(value: number) => [formatMoney(value, gym?.currency), 'Revenue']} />} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Member Count Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-200">
                  <Users className="h-5 w-5 text-blue-400" strokeWidth={1.5} /> New Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!memberData?.newMembers || memberData.newMembers.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <BarChart3 className="h-8 w-8 opacity-30 mb-2" strokeWidth={1.5} />
                    <p className="text-xs">No member data</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={memberData.newMembers} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-6} />
                      <Tooltip content={<CustomTooltip formatter={(value: number) => [value, 'New Members']} />} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="p-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-200">
                  <TrendingUp className="h-5 w-5 text-emerald-400" strokeWidth={1.5} /> Renewals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(!memberData?.renewals || memberData.renewals.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <BarChart3 className="h-8 w-8 opacity-30 mb-2" strokeWidth={1.5} />
                    <p className="text-xs">No renewal data</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={memberData.renewals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-6} />
                      <Tooltip content={<CustomTooltip formatter={(value: number) => [value, 'Renewals']} />} />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
