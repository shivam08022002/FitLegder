import { IndianRupee, Users, TrendingUp, CalendarCheck, Bell } from 'lucide-react';

const bars = [42, 58, 50, 72, 65, 88, 80];

export default function DashboardMockup() {
  return (
    <div className="relative select-none" aria-hidden="true">
      {/* Floating notification card */}
      <div className="absolute -left-6 top-16 z-20 hidden sm:block float-y-slow">
        <div className="glass-card glow-border flex items-center gap-3 rounded-2xl px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <CalendarCheck className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Attendance marked</p>
            <p className="text-[10px] text-slate-400">124 members present today</p>
          </div>
        </div>
      </div>

      {/* Floating renewal card */}
      <div className="absolute -right-4 bottom-10 z-20 hidden sm:block float-y">
        <div className="glass-card glow-border flex items-center gap-3 rounded-2xl px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">7 renewals due</p>
            <p className="text-[10px] text-slate-400">Reminders sent automatically</p>
          </div>
        </div>
      </div>

      {/* Main dashboard panel */}
      <div className="glass-card glow-border float-y overflow-hidden rounded-[28px] p-5 shadow-2xl">
        {/* Window chrome */}
        <div className="mb-5 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs font-medium text-slate-400">GymArchive · Dashboard</span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: IndianRupee, label: "Today's Revenue", value: '₹18,400', tone: 'text-emerald-400 bg-emerald-500/15' },
            { icon: Users, label: 'Active Members', value: '842', tone: 'text-violet-400 bg-violet-500/15' },
            { icon: TrendingUp, label: 'Growth', value: '+12.4%', tone: 'text-sky-400 bg-sky-500/15' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3 flex flex-col justify-between">
              <div className={`mb-1.5 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${s.tone} shrink-0`}>
                <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
              </div>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 truncate">{s.label}</p>
              <p className="mt-0.5 text-xs sm:text-base font-bold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-white">Monthly Revenue</p>
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              Last 7 months
            </span>
          </div>
          <div className="flex h-24 items-end justify-between gap-2">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t-md bg-gradient-to-t from-violet-600/40 to-fuchsia-500/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Member row */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
              R
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Rahul Sharma</p>
              <p className="text-[10px] text-slate-400">Premium · 12 months</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
