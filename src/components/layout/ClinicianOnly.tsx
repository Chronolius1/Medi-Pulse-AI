import type { ReactNode } from 'react';
import { useAppState } from '../../hooks/useApp';

/**
 * Single choke point for role gating.
 *
 * IMPORTANT: this is a UI affordance, not a security boundary. All state lives
 * in the visitor's own browser, so a patient-role user can still reach the data
 * through devtools. It exists to keep clinician-only controls out of a patient
 * view, not to protect anything.
 */
export function ClinicianOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useAppState();
  return <>{role === 'clinician' ? children : fallback}</>;
}
