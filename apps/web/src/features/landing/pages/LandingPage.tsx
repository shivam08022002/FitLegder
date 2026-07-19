import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import fitledgerLockup from '@/Assets/fitledger_lockup_columnweights.svg';
import { ArrowRight, PlayCircle, Menu, X, CheckCircle2 } from 'lucide-react';
import DashboardMockup from '../components/DashboardMockup';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import WhyChoose from '../components/WhyChoose';
import Testimonials from '../components/Testimonials';
import Faq from '../components/Faq';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const trustedSegments = [
  'Gym Owners', 'Fitness Studios', 'CrossFit Boxes', 'Yoga Studios',
  'Personal Trainers', 'Martial Arts Academies',
];

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0E14]">
      <div className="grid-pattern absolute inset-0 opacity-60" />
      <div className="aurora-blob aurora-blob-anim left-[-10%] top-[-5%] h-[520px] w-[520px] bg-violet-600/20 [animation:aurora-drift_16s_ease-in-out_infinite]" />
      <div className="aurora-blob right-[-8%] top-[20%] h-[460px] w-[460px] bg-fuchsia-500/15 [animation:aurora-drift_20s_ease-in-out_infinite_reverse]" />
      <div className="aurora-blob bottom-[-10%] left-[30%] h-[500px] w-[500px] bg-sky-500/10 [animation:aurora-drift_24s_ease-in-out_infinite]" />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img src={fitledgerLockup} alt="FitLedger" className="h-8 object-contain" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-300 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-slate-200">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          className="text-slate-200 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#0B0E14]/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:pt-40">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="reveal-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All-in-one gym management platform
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
            Manage your gym{' '}
            <span className="gradient-text gradient-animate bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              like a pro
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
            Manage members, collect payments, track attendance, monitor renewals and grow your
            fitness business effortlessly — all from one intelligent dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-lg shadow-violet-500/25">
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">
                <PlayCircle className="h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
            {['No credit card required', '14-day free trial', 'Cancel anytime'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal-up [animation-delay:120ms]">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function TrustedBy() {
  const items = [...trustedSegments, ...trustedSegments];
  return (
    <section className="relative border-y border-white/5 py-10">
      <p className="mb-6 text-center text-sm text-slate-500">
        Trusted by <span className="font-semibold text-slate-300">1000+</span> fitness businesses
      </p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track gap-10">
          {items.map((label, i) => (
            <span key={`${label}-${i}`} className="whitespace-nowrap text-lg font-semibold text-slate-600">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="glow-border relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-indigo-600/20 px-6 py-16 text-center md:py-20">
        <div className="aurora-blob left-1/2 top-0 h-72 w-72 -translate-x-1/2 bg-violet-500/25" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
            Ready to transform your gym management?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-slate-300">
            Join thousands of gym owners who run their business smarter with FitLedger.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-lg shadow-violet-500/25">
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Book Live Demo</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {['Free trial', 'Setup in minutes', 'No credit card required'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    { title: 'Product', links: ['Features', 'How it works', 'FAQ'] },
    { title: 'Company', links: ['About', 'Contact', 'Careers'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
  ];

  return (
    <footer className="relative border-t border-white/5 px-6 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-5">
        <div className="col-span-2">
          <img src={fitledgerLockup} alt="FitLedger" className="h-8 object-contain" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            The all-in-one platform to manage members, payments, attendance and renewals for your
            fitness business.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} FitLedger. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Link to="/login" className="transition-colors hover:text-slate-300">Sign In</Link>
          <Link to="/register" className="transition-colors hover:text-slate-300">Create account</Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-foreground">
      <Background />
      <Nav />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <WhyChoose />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
