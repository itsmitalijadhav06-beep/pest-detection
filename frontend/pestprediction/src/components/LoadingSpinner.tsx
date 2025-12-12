import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Loader2, Bug } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'spinner' | 'analyzing';
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export function LoadingSpinner({ size = 'md', className, variant = 'spinner' }: LoadingSpinnerProps) {
  const { t } = useTranslation();

  if (variant === 'analyzing') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bug className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">{t('loading.analyzing')}</p>
          <p className="text-sm text-muted-foreground">{t('loading.aiIdentifying')}</p>
        </div>
      </div>
    );
  }

  return (
    <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
  );
}
