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
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <span className="section-label">How it works</span>
        <h2 className="mt-3 text-balance text-2xl font-bold sm:text-4xl md:text-5xl">
          Up and running in six simple steps
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div 
            key={s.title} 
            className="glass-card glow-border group relative rounded-2xl p-5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/20 shadow-sm hover:shadow-md hover:shadow-violet-500/5"
          >
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <span className="inline-flex items-center justify-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                Step {i + 1}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform duration-300">
                <s.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white transition-colors">{s.title}</h3>
            <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-slate-400 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
