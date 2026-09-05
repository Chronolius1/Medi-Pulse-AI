import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

const CONTROL =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ' +
  'outline-none transition placeholder:text-slate-600 focus:border-blue-500 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Associates a label with its control. The original markup had ~20 bare
 * <label> elements with no `for`, so none of them were announced by a screen
 * reader or clickable to focus the field.
 */
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint || error ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>
      {children({ id, 'aria-describedby': hintId })}
      {(hint || error) && (
        <p
          id={hintId}
          className={clsx('mt-1 text-[11px]', error ? 'text-rose-400' : 'text-slate-500')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={clsx(CONTROL, className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={clsx(CONTROL, className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={clsx(CONTROL, 'cursor-pointer', className)} {...rest}>
        {children}
      </select>
    );
  },
);
