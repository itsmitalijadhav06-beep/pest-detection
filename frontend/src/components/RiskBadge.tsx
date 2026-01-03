import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export type RiskLevel = 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

export const RiskBadge = ({ risk, className }: RiskBadgeProps) => {
  const config = {
    high: {
      label: 'High Risk',
      icon: AlertCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    medium: {
      label: 'Medium Risk',
      icon: AlertTriangle,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    low: {
      label: 'Low Risk',
      icon: CheckCircle,
      className: 'bg-success/10 text-success border-success/20',
    },
  };

  const safeRisk: RiskLevel = risk ?? 'low';
  const { label, icon: Icon, className: levelClass } = config[safeRisk];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        levelClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};
