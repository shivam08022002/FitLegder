import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'FitLedger replaced three notebooks and a messy spreadsheet. Marking attendance takes seconds and I finally know my real monthly revenue.',
    name: 'Arjun Mehta',
    role: 'Owner, IronForge Gym',
    initial: 'A',
  },
  {
    quote:
      'The renewal reminders alone paid for themselves. We stopped losing members who simply forgot to renew.',
    name: 'Priya Nair',
    role: 'Founder, FlowState Yoga',
    initial: 'P',
  },
  {
    quote:
      'No biometric device, no fuss. My front desk marks attendance with one click and the reports are ready instantly.',
    name: 'Rohit Verma',
    role: 'Head Coach, Apex CrossFit',
    initial: 'R',
  },
];

export default function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="section-label">Loved by gym owners</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
          Trusted by fitness businesses everywhere
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="glass-card glow-border flex flex-col rounded-xl p-5">
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                {t.initial}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
