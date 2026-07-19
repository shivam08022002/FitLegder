import { X, Check } from 'lucide-react';

const without = [
  'Notebook & paper records',
  'Forgotten renewals',
  'Manual revenue calculations',
  'Lost payment records',
  'Attendance confusion',
];

const withFit = [
  'Everything organised in one place',
  'Automatic renewal reminders',
  'Real-time revenue insights',
  'Complete payment history',
  'One-click attendance tracking',
];

export default function WhyChoose() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <span className="section-label">Why FitLedger</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
          Ditch the notebook. Run it like a pro.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Without */}
        <div className="glass-card rounded-3xl border-white/5 p-8">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-300">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
              <X className="h-4 w-4" />
            </span>
            Without FitLedger
          </h3>
          <ul className="space-y-4">
            {without.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                <X className="h-4 w-4 shrink-0 text-rose-400/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* With */}
        <div className="glass-card glow-border rounded-3xl p-8">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-4 w-4" />
            </span>
            With FitLedger
          </h3>
          <ul className="space-y-4">
            {withFit.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
