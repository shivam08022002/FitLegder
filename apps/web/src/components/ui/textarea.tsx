import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-white/5 bg-slate-800/30 px-3 py-2 text-sm text-foreground ring-offset-background transition-all duration-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-emerald-400/60 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
