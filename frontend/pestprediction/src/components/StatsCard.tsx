import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variants = {
  default: 'bg-card',
  primary: 'gradient-primary text-primary-foreground',
  success: 'gradient-safe text-success-foreground',
  warning: 'gradient-warning text-warning-foreground',
  danger: 'gradient-danger text-destructive-foreground',
};

const iconVariants = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success-foreground/20 text-success-foreground',
  warning: 'bg-warning-foreground/20 text-warning-foreground',
  danger: 'bg-destructive-foreground/20 text-destructive-foreground',
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', variants[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn(
              'text-sm font-medium mb-1',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn(
                'text-xs mt-1',
                variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn(
                'text-xs mt-2 font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconVariants[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
