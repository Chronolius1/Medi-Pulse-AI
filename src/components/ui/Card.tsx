import type { ElementType, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Explicit card surface.
 *
 * med.css bound `animation: fadeSlideUp` directly to the `.bg-slate-900`
 * Tailwind utility, so every element that happened to use that colour animated
 * — modals, the chat drawer, every panel. In React, where remounts are routine,
 * that would fire constantly. The animation belongs to this component instead.
 */
export function Card({
  as: Tag = 'div',
  className,
  animate = true,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  animate?: boolean;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={clsx(
        'rounded-xl border border-slate-800 bg-slate-900',
        animate && 'motion-safe:animate-fade-slide-up',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  icon,
  title,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center justify-between gap-3', className)}>
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}
