import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const STATUS_CONFIG = {
  TODO: { label: 'To Do', variant: 'secondary' as const, icon: Clock },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' as const, icon: AlertCircle },
  DONE: { label: 'Done', variant: 'success' as const, icon: CheckCircle2 },
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', class: 'text-emerald-600 bg-emerald-50' },
  MEDIUM: { label: 'Medium', class: 'text-amber-600 bg-amber-50' },
  HIGH: { label: 'High', class: 'text-red-600 bg-red-50' },
};
