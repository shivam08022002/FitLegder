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
    className: 'md:col-span-2 md:row-span-2',
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
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <span className="section-label">Everything in one place</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
          The complete toolkit to run your gym
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-slate-400">
          From front-desk attendance to revenue analytics, FitLedger replaces your notebooks and
          spreadsheets with one intelligent dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {features.map((f) => (
          <article
            key={f.title}
            className={`glass-card glow-border group flex flex-col rounded-3xl p-6 ${f.className ?? ''}`}
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${f.tone}`}>
              <f.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            <ul className="mt-4 space-y-2">
              {f.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
