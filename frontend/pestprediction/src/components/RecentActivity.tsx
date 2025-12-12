import { useTranslation } from 'react-i18next';
import { Prediction } from '@/types/prediction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PredictionCard } from '@/components/PredictionCard';
import { History, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentActivityProps {
  predictions: Prediction[];
  onClear: () => void;
}

export function RecentActivity({ predictions, onClear }: RecentActivityProps) {
  const { t } = useTranslation();

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            {t('activity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('activity.noDetections')}</p>
            <p className="text-xs">{t('activity.historyAppear')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            {t('activity.title')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {t('common.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PredictionCard prediction={prediction} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
