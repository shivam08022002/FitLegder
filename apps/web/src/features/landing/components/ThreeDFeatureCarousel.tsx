import { memo, useEffect, useLayoutEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  CalendarCheck, Users, CreditCard, RefreshCw, BarChart3,
  CalendarDays, FileText, ShieldCheck, Sparkles, X, ArrowRight,
  Building2, ClipboardList, UserPlus, Wallet, Rocket,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === 'undefined';

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (q: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(q).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  const handleChange = () => {
    setMatches(getMatches(query));
  };

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);
    handleChange();

    matchMedia.addEventListener('change', handleChange);

    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

export type FeatureCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  desc: string;
  points: string[];
  gradient: string;
  borderGlow: string;
  badge: string;
};

export const featureCards: FeatureCard[] = [
  {
    id: 'attendance',
    icon: CalendarCheck,
    title: 'Manual Attendance',
    tagline: 'Instant check-in without biometric hardware',
    desc: 'One-click daily check-in with calendar logs and attendance percentage history.',
    points: ['One-click daily check-in', 'Calendar history & streaks', 'Monthly attendance logs', 'No hardware required'],
    gradient: 'from-emerald-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Hardware Free',
  },
  {
    id: 'members',
    icon: Users,
    title: 'Member Profiles',
    tagline: 'Complete 360-degree member records',
    desc: 'Track join dates, assigned plans, payment status, and emergency contacts in one place.',
    points: ['Comprehensive profiles', 'Active/inactive status filtering', 'Emergency contact records', 'Instant search & quick edit'],
    gradient: 'from-cyan-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Core Directory',
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Payment Tracking',
    tagline: 'Cash, UPI & Card payment logging',
    desc: 'Record transactions effortlessly, track outstanding dues, and issue digital receipts.',
    points: ['Multi-mode payment logging', 'Pending dues tracker', 'Instant payment receipts', 'Revenue overview'],
    gradient: 'from-sky-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-sky-500/60 group-hover:border-sky-400 shadow-sky-500/20',
    badge: 'Finances',
  },
  {
    id: 'renewals',
    icon: RefreshCw,
    title: 'Auto Renewals',
    tagline: 'Never lose a member to missed renewals',
    desc: 'Automated expiry alerts notify you of upcoming subscription ends in advance.',
    points: ['Upcoming expiry warnings', 'One-click plan renewal', 'Automated reminders', 'Retention analytics'],
    gradient: 'from-teal-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-teal-500/60 group-hover:border-teal-400 shadow-teal-500/20',
    badge: 'Automation',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Revenue Analytics',
    tagline: 'Real-time financial & growth insights',
    desc: 'Visualize daily revenue, active member ratios, and growth trajectories live.',
    points: ['Real-time revenue metrics', 'Growth trend graphs', 'Membership ratio charts', 'Financial forecasting'],
    gradient: 'from-amber-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-amber-500/60 group-hover:border-amber-400 shadow-amber-500/20',
    badge: 'Real-Time',
  },
  {
    id: 'events',
    icon: CalendarDays,
    title: 'Events & Classes',
    tagline: 'Public landing pages for competitions',
    desc: 'Host fitness challenges and seminars with custom public registration links.',
    points: ['Public sign-up landing pages', 'Participant registration queue', 'Event management & logs', 'Boost member engagement'],
    gradient: 'from-emerald-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Engagement',
  },
  {
    id: 'reports',
    icon: FileText,
    title: 'PDF & Excel Reports',
    tagline: 'Instant data export for tax & audits',
    desc: 'Generate exportable PDF and Excel spreadsheets for accountant reviews.',
    points: ['PDF & Excel report export', 'Custom date range filter', 'Member attendance logs', 'Revenue audits'],
    gradient: 'from-rose-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-rose-500/60 group-hover:border-rose-400 shadow-rose-500/20',
    badge: 'Data Export',
  },
  {
    id: 'security',
    icon: ShieldCheck,
    title: 'Secure SaaS Portal',
    tagline: '256-bit SSL encryption & backups',
    desc: 'Enterprise-grade JWT auth, role permissions, and automated cloud backups.',
    points: ['Role-based access control', 'SSL 256-bit encryption', 'Activity & audit logs', 'Automated cloud backup'],
    gradient: 'from-teal-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-teal-500/60 group-hover:border-teal-400 shadow-teal-500/20',
    badge: 'Security',
  },
];

export const stepCards: FeatureCard[] = [
  {
    id: 'step-1',
    icon: Building2,
    title: '1. Add Your Gym',
    tagline: 'Set up your gym profile in 2 minutes',
    desc: 'Create your account, specify gym details, working hours, and upload logo.',
    points: ['Quick account creation', 'Custom gym profile & logo', 'Role & admin config', '30-day free trial'],
    gradient: 'from-cyan-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Step 1',
  },
  {
    id: 'step-2',
    icon: ClipboardList,
    title: '2. Create Plans',
    tagline: 'Define membership tiers & pricing',
    desc: 'Set up monthly or annual plans with custom pricing and admission fees.',
    points: ['Flexible plan durations', 'Custom pricing & discounts', 'Admission fee config', 'Unlimited tiers'],
    gradient: 'from-teal-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-teal-500/60 group-hover:border-teal-400 shadow-teal-500/20',
    badge: 'Step 2',
  },
  {
    id: 'step-3',
    icon: UserPlus,
    title: '3. Onboard Members',
    tagline: 'Add members with complete details',
    desc: 'Add members, assign active plans, emergency contacts, and medical notes.',
    points: ['Fast member entry', 'Assign active plans', 'Medical & emergency info', 'Member search & filter'],
    gradient: 'from-sky-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-sky-500/60 group-hover:border-sky-400 shadow-sky-500/20',
    badge: 'Step 3',
  },
  {
    id: 'step-4',
    icon: CalendarCheck,
    title: '4. Mark Attendance',
    tagline: 'One-tap front desk attendance',
    desc: 'Log member visits daily with a single click. View calendar history.',
    points: ['No biometric hardware required', 'Calendar & daily logs', 'Streak percentage tracking', 'Instant check-in'],
    gradient: 'from-emerald-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Step 4',
  },
  {
    id: 'step-5',
    icon: Wallet,
    title: '5. Collect Payments',
    tagline: 'Track dues & multi-mode payments',
    desc: 'Log cash, UPI, or card payments and issue instant digital receipts.',
    points: ['Cash, UPI & Card support', 'Pending dues tracker', 'Digital receipts', 'Revenue tracking'],
    gradient: 'from-amber-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-amber-500/60 group-hover:border-amber-400 shadow-amber-500/20',
    badge: 'Step 5',
  },
  {
    id: 'step-6',
    icon: Rocket,
    title: '6. Scale & Automate',
    tagline: 'Automate renewals & view insights',
    desc: 'Automated expiry alerts handle renewals while real-time analytics drive growth.',
    points: ['Automated expiry warnings', 'One-click plan renewal', 'Real-time analytics', 'Scale your gym'],
    gradient: 'from-emerald-950/95 via-slate-900 to-slate-950',
    borderGlow: 'border-emerald-500/60 group-hover:border-emerald-400 shadow-emerald-500/20',
    badge: 'Step 6',
  },
];

const duration = 0.15;
const transition = { duration, ease: [0.32, 0.72, 0, 1] as const };
const transitionOverlay = { duration: 0.35, ease: [0.32, 0.72, 0, 1] as const };

const Carousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
    faceWidthOverride,
  }: {
    handleClick: (card: FeatureCard) => void;
    controls: any;
    cards: FeatureCard[];
    isCarouselActive: boolean;
    faceWidthOverride?: number;
  }) => {
    const isMobile = useMediaQuery('(max-width: 640px)');
    
    const defaultDesktopWidth = faceWidthOverride || 230;
    const faceWidth = isMobile ? 160 : defaultDesktopWidth;
    const faceCount = cards.length;

    // Polygon circumradius formula: R = side / (2 * sin(PI / N))
    const radius = Math.round(faceWidth / (2 * Math.sin(Math.PI / faceCount)));
    const perspective = isMobile ? '800px' : '1400px';
    
    const rotation = useMotionValue(0);
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    );

    return (
      <div
        className="flex h-full w-full items-center justify-center select-none overflow-hidden py-1 sm:py-6"
        style={{
          perspective,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <motion.div
          drag={isCarouselActive ? 'x' : false}
          className="relative flex h-full w-full origin-center cursor-grab items-center justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            transformStyle: 'preserve-3d',
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.15)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.15,
              transition: {
                type: 'spring',
                stiffness: 110,
                damping: 25,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {cards.map((card, i) => {
            const Icon = card.icon;
            const angle = i * (360 / faceCount);
            return (
              <motion.div
                key={`key-${card.id}-${i}`}
                className="absolute flex h-[200px] sm:h-[280px] origin-center items-center justify-center p-1"
                style={{
                  width: `${faceWidth}px`,
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                onClick={() => handleClick(card)}
              >
                <motion.div
                  layoutId={`card-container-${card.id}`}
                  className={`group relative flex h-full w-full flex-col justify-between rounded-xl sm:rounded-2xl border ${card.borderGlow} bg-[#0a0e1a] bg-gradient-to-b ${card.gradient} p-2.5 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] cursor-pointer overflow-hidden opacity-100`}
                  transition={transition}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-white/25 bg-white/15 text-white shrink-0 shadow-inner">
                      <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="rounded-full border border-white/25 bg-white/15 px-1.5 py-0.5 sm:px-2.5 text-[8.5px] sm:text-xs font-bold text-slate-100 uppercase tracking-wider truncate">
                      {card.badge}
                    </span>
                  </div>

                  <div className="my-auto space-y-1 sm:space-y-2 py-0.5">
                    <h3 className="text-[11px] sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[9.5px] sm:text-xs text-slate-200 font-medium leading-tight sm:leading-relaxed line-clamp-3">
                      {card.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/15 pt-1.5 sm:pt-3">
                    <span className="text-[9.5px] sm:text-xs font-semibold text-emerald-300 group-hover:text-white flex items-center gap-1">
                      Details <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-300 group-hover:text-amber-400 transition-colors" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }
);

export default function ThreeDFeatureCarousel({
  cards = featureCards,
  ctaPrefix = 'Try',
  faceWidthOverride,
  stageHeightClass = 'h-[290px] sm:h-[460px]',
}: {
  cards?: FeatureCard[];
  ctaPrefix?: string;
  faceWidthOverride?: number;
  stageHeightClass?: string;
}) {
  const [activeCard, setActiveCard] = useState<FeatureCard | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();

  const handleClick = (card: FeatureCard) => {
    setActiveCard(card);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveCard(null);
    setIsCarouselActive(true);
  };

  return (
    <div className="relative mt-1 mb-0 sm:mt-2 sm:mb-1">
      <AnimatePresence mode="sync">
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            transition={transitionOverlay}
          >
            <motion.div
              layoutId={`card-container-${activeCard.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-md w-full rounded-2xl border ${activeCard.borderGlow} bg-[#0a0e1a] bg-gradient-to-b ${activeCard.gradient} p-5 sm:p-6 shadow-2xl backdrop-blur-2xl`}
              transition={transition}
            >
              <button
                onClick={handleClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-white shadow-xl shrink-0">
                  <activeCard.icon className="h-5.5 w-5.5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                    {activeCard.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {activeCard.title}
                  </h3>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {activeCard.tagline}
              </p>

              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {activeCard.desc}
              </p>

              <div className="mt-4 space-y-1.5 border-t border-white/15 pt-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Key Capabilities:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeCard.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/10 p-1.5 text-xs text-slate-100 font-medium"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-300 shrink-0" />
                      <span className="truncate">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                <Button asChild className="flex-1 h-10 rounded-lg shadow-lg shadow-emerald-500/25 font-bold text-xs">
                  <Link to="/register">
                    {ctaPrefix} {activeCard.title.replace(/^\d+\.\s*/, '')}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-10 rounded-lg border-white/20 text-slate-200 hover:bg-white/10 text-xs"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-3 sm:mb-5">
        <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 rounded-full animate-pulse shadow-sm">
          ↔ Drag to rotate • Click for details
        </p>
      </div>

      <div className={`relative ${stageHeightClass} w-full overflow-visible py-4`}>
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
          faceWidthOverride={faceWidthOverride}
        />
      </div>
    </div>
  );
}
