import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      {icon && <div className="text-slate-600">{icon}</div>}
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      {body && <p className="max-w-sm text-xs text-slate-500">{body}</p>}
      {action}
    </div>
  );
}
