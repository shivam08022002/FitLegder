import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-white/5 text-slate-300',
        destructive: 'border-transparent bg-rose-500/10 text-rose-400',
        outline: 'text-foreground',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        expiring: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        critical: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        expired: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        none: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
