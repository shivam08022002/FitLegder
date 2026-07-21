import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Can I use it without a biometric device?',
    a: 'Absolutely. GymArchive is built around a manual, one-click attendance system — no biometric or hardware required. Your front desk can mark members present in seconds.',
  },
  {
    q: 'Can I track attendance manually?',
    a: 'Yes. Daily attendance logs, present/absent history, attendance percentages, monthly reports and a visual calendar are all included.',
  },
  {
    q: 'Can I add custom membership plans?',
    a: 'You can create unlimited plans with your own durations and pricing, then assign them to members and renew with one click.',
  },
  {
    q: 'Can I export reports?',
    a: 'Revenue, attendance, payment and renewal reports can be exported to PDF and Excel whenever you need them.',
  },
  {
    q: 'Is my data secure?',
    a: 'GymArchive uses secure authentication, role-based access and audit logs, with regular backups to keep your gym data safe.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative mx-auto max-w-3xl px-5 py-10 sm:px-6 md:py-16">
      <div className="mb-8 text-center">
        <span className="section-label">FAQ</span>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
          Questions, answered
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="glass-card overflow-hidden rounded-xl">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-medium text-white">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-violet-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
