import {
  Users, CreditCard, CalendarCheck, RefreshCw, BarChart3,
  CalendarDays, FileText, ShieldCheck, type LucideIcon,
} from 'lucide-react';

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  points: string[];
  tone: string;
  className?: string;
};

const features: Feature[] = [
  {
    icon: CalendarCheck,
    title: 'Manual Attendance System',
    desc: 'One-click check-in with no biometric hardware required. Track daily logs, percentages and monthly reports on a clean calendar.',
    points: ['One-click attendance', 'Present / absent history', 'Attendance calendar', 'Monthly reports'],
    tone: 'text-emerald-400 bg-emerald-500/15',
    className: 'sm:col-span-2',
  },
  {
    icon: Users,
    title: 'Member Management',
    desc: 'Complete member profiles with plans, history, medical notes and emergency contacts.',
    points: ['Profiles & plans', 'Membership history', 'Emergency contacts'],
    tone: 'text-violet-400 bg-violet-500/15',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    desc: 'Record cash, UPI and card payments, track outstanding dues and view revenue at a glance.',
    points: ['Cash · UPI · Card', 'Outstanding dues', 'Revenue dashboard'],
    tone: 'text-sky-400 bg-sky-500/15',
  },
  {
    icon: RefreshCw,
    title: 'Membership Renewals',
    desc: 'Never miss a renewal with automatic reminders and one-click renew.',
    points: ['Upcoming renewals', 'Auto reminders', 'One-click renewal'],
    tone: 'text-fuchsia-400 bg-fuchsia-500/15',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    desc: 'Revenue, active members and growth trends visualised in real time.',
    points: ["Today's & monthly revenue", 'Active vs expired', 'Growth graph'],
    tone: 'text-amber-400 bg-amber-500/15',
  },
  {
    icon: CalendarDays,
    title: 'Events Management',
    desc: 'Run challenges, classes, seminars and competitions with public registration.',
    points: ['Fitness challenges', 'Classes & seminars', 'Public sign-up links'],
    tone: 'text-indigo-400 bg-indigo-500/15',
  },
  {
    icon: FileText,
    title: 'Reports & Exports',
    desc: 'Revenue, attendance and renewal reports exportable to PDF and Excel.',
    points: ['Revenue & attendance', 'Member growth', 'Export PDF / Excel'],
    tone: 'text-rose-400 bg-rose-500/15',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Admin Panel',
    desc: 'Role-based access, audit logs and secure authentication keep your data safe.',
    points: ['Role-based access', 'Audit & activity logs', 'Secure auth & backups'],
    tone: 'text-teal-400 bg-teal-500/15',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <span className="section-label">Everything in one place</span>
        <h2 className="mt-3 text-balance text-2xl font-bold sm:text-4xl md:text-5xl">
          The complete toolkit to run your gym
        </h2>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
          From front-desk attendance to revenue analytics, FitLedger replaces your notebooks and
          spreadsheets with one intelligent dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="glass-card glow-border group flex gap-4 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.02] hover:-translate-y-0.5 border border-white/5 bg-white/[0.01] hover:border-violet-500/20 shadow-sm hover:shadow-md hover:shadow-violet-500/5"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 ${f.tone}`}>
              <f.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 transition-colors group-hover:text-white">{f.title}</h3>
              <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-slate-400 font-medium">{f.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
