import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/prediction';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusIndicatorProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function StatusIndicator({ level, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const { t } = useTranslation();

  const config = {
    safe: {
      icon: Shield,
      label: t('status.safe'),
      className: 'gradient-safe text-success-foreground',
      dotClass: 'bg-success',
    },
    warning: {
      icon: AlertTriangle,
      label: t('status.warning'),
      className: 'gradient-warning text-warning-foreground',
      dotClass: 'bg-warning',
    },
    danger: {
      icon: AlertOctagon,
      label: t('status.highRisk'),
      className: 'gradient-danger text-destructive-foreground',
      dotClass: 'bg-destructive',
    },
  };

  const { icon: Icon, label, className, dotClass } = config[level];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('rounded-full flex items-center justify-center', className, sizes[size])}>
        <Icon className={iconSizes[size]} />
      </div>
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full animate-pulse-soft', dotClass)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const { t } = useTranslation();

  const levelMap: Record<string, RiskLevel> = {
    low: 'safe',
    medium: 'warning',
    high: 'danger',
  };
  
  const labels = {
    low: t('status.lowRisk'),
    medium: t('status.mediumRisk'),
    high: t('status.highRisk'),
  };

  const classMap = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      classMap[severity]
    )}>
      <StatusIndicator level={levelMap[severity]} size="sm" />
      {labels[severity]}
    </span>
  );
}
