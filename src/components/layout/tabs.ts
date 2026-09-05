import { Activity, FileText, LineChart, Stethoscope } from 'lucide-react';
import type { TabId } from '../../types';

export const TABS: { id: TabId; label: string; short: string; icon: typeof Activity }[] = [
  { id: 'intake', label: '1. Intake', short: 'Intake', icon: Activity },
  { id: 'record', label: '2. Record', short: 'Record', icon: FileText },
  { id: 'compare', label: '3. Trends', short: 'Trends', icon: LineChart },
  { id: 'doctors', label: '4. Find Care', short: 'Care', icon: Stethoscope },
];
