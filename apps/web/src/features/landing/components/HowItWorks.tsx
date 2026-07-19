import { Building2, ClipboardList, UserPlus, CalendarCheck, Wallet, Rocket, type LucideIcon } from 'lucide-react';

const steps: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Building2, title: 'Add your gym', desc: 'Create your account and set up your gym profile in minutes.' },
  { icon: ClipboardList, title: 'Create plans', desc: 'Define membership plans, durations and pricing.' },
  { icon: UserPlus, title: 'Add members', desc: 'Onboard members with full profiles and contact details.' },
  { icon: CalendarCheck, title: 'Mark attendance', desc: 'Log daily attendance with a single click — no hardware.' },
  { icon: Wallet, title: 'Collect payments', desc: 'Record cash, UPI and card payments and track dues.' },
  { icon: Rocket, title: 'Grow your business', desc: 'Use analytics and reminders to scale confidently.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <span className="section-label">How it works</span>
        <h2 className="mt-3 text-balance text-2xl font-bold sm:text-4xl md:text-5xl">
          Up and running in six simple steps
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="glass-card glow-border relative rounded-2xl p-5 sm:rounded-3xl sm:p-6">
            <span className="absolute right-6 top-5 text-4xl font-bold text-white/5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
              <s.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
