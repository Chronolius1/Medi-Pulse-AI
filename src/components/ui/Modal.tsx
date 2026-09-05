import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Button } from './Button';

/**
 * Accessible dialog.
 *
 * The original modals were plain divs toggled with `classList.add('hidden')`:
 * no focus trap, no Escape handling, no `role`/`aria-modal`, no focus
 * restoration, and background content stayed reachable by Tab. Radix supplies
 * all of that correctly rather than approximately.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm motion-safe:animate-fade-in" />
        <Dialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-[70] flex w-[94vw] -translate-x-1/2 -translate-y-1/2 flex-col',
            'rounded-xl border border-slate-800 bg-slate-900 shadow-2xl',
            // Header and footer stay pinned; only the body scrolls, so the
            // confirm action is always reachable on a short viewport.
            'max-h-[90vh] motion-safe:animate-modal-in',
            { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 pb-3">
            <div>
              <Dialog.Title className="text-sm font-bold text-white">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-xs text-slate-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close dialog"
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-slate-800 p-5 pt-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  extra,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  extra?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {extra}
    </Modal>
  );
}
