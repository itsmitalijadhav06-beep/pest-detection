import { useTranslation } from 'react-i18next';
import { Prediction } from '@/types/prediction';
import { SeverityBadge } from './StatusIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Bug, Clock, Percent } from 'lucide-react';
import { format } from 'date-fns';

interface PredictionCardProps {
  prediction: Prediction;
  variant?: 'default' | 'featured';
}

export function PredictionCard({ prediction, variant = 'default' }: PredictionCardProps) {
  const { t } = useTranslation();
  const isFeatured = variant === 'featured';

  return (
    <Card className={`overflow-hidden animate-scale-in ${isFeatured ? 'border-2 border-primary shadow-glow' : ''}`}>
      <CardContent className={`p-0 ${isFeatured ? 'p-0' : ''}`}>
        <div className={`flex ${isFeatured ? 'flex-col md:flex-row' : 'flex-row'} gap-4`}>
          {/* Image */}
    <div className={`relative ${
  isFeatured
    ? 'w-full md:w-56 aspect-video rounded-lg overflow-hidden'
    : 'w-24 aspect-square rounded-md overflow-hidden flex-shrink-0 bg-muted'
}`}>
  <img
    src={prediction.imageUrl}
    alt={prediction.pestName}
    className="w-full h-full object-cover object-center"
  />
</div>

          {/* Content */}
          <div className={`flex-1 ${isFeatured ? 'p-6' : 'py-3 pr-4'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className={`${isFeatured ? 'w-6 h-6' : 'w-4 h-4'} text-primary`} />
                  <h3 className={`font-bold ${isFeatured ? 'text-2xl' : 'text-sm'} text-foreground`}>
                    {prediction.pestName}
                  </h3>
                </div>
                
                <div className={`flex flex-wrap items-center gap-3 ${isFeatured ? 'mb-4' : 'mb-2'}`}>
                  <SeverityBadge severity={prediction.severity} />
                </div>

                <div className={`flex flex-wrap items-center gap-4 text-muted-foreground ${isFeatured ? 'text-sm' : 'text-xs'}`}>
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    {(prediction.confidence * 100).toFixed(1)}% {t('common.confidence')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {format(prediction.timestamp, 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PredictionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48 h-48 animate-shimmer" />
          <div className="flex-1 p-6 space-y-4">
            <div className="h-8 w-48 animate-shimmer rounded" />
            <div className="h-6 w-32 animate-shimmer rounded-full" />
            <div className="flex gap-4">
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-4 w-32 animate-shimmer rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
