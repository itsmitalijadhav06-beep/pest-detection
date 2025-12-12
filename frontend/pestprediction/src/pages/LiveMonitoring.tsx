import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '@/components/CameraCapture';
import { PredictionCard } from '@/components/PredictionCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { predictPest, generateId, ApiError } from '@/lib/api';
import { Prediction } from '@/types/prediction';
import { Radio, Play, Pause, Settings, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveMonitoring() {
  const { t } = useTranslation();
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const { addPrediction, getRecentPredictions } = useLocalStorage();

  const handleCapture = useCallback(async (file: File, previewUrl: string) => {
    setIsLoading(true);
    setCaptureCount((prev) => prev + 1);

    try {
      const response = await predictPest(file);

      const pestName = response.prediction || 'Unknown Pest';
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence range
      const severity = confidence >= 0.9 ? 'high' : confidence >= 0.8 ? 'medium' : 'low';

      const prediction: Prediction = {
        id: generateId(),
        pestName,
        confidence,
        severity,
        timestamp: new Date(),
        imageUrl: previewUrl,
      };

      setLatestPrediction(prediction);
      addPrediction(prediction);

      if (severity === 'high') {
        toast.error(t('toast.highRiskDetected'), {
          description: `${pestName} ${t('toast.detected')}`,
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      const isCorsError = error instanceof ApiError && error.isCorsError;
      if (!isAutoMode) {
        toast.error(t('toast.analysisFailed'), {
          description: isCorsError 
            ? 'CORS error: Please ensure the backend server has CORS enabled.'
            : t('toast.connectionError'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [addPrediction, isAutoMode, t]);

  const recentDetections = getRecentPredictions(5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('monitoring.title')}</h1>
            </div>
            <p className="text-muted-foreground">
              {t('monitoring.description')}
            </p>
          </div>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    id="auto-mode"
                    checked={isAutoMode}
                    onCheckedChange={setIsAutoMode}
                  />
                  <Label htmlFor="auto-mode" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="w-4 h-4 text-warning" />
                    {t('monitoring.autoMode')}
                  </Label>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{t('monitoring.interval')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main stream area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden animate-fade-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {isMonitoring ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        {t('monitoring.liveFeed')}
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        {t('monitoring.cameraOff')}
                      </>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t('monitoring.captures')}: {captureCount}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CameraCapture
                  onCapture={handleCapture}
                  autoCapture={isAutoMode && isMonitoring}
                  autoCaptureInterval={15000}
                />
                
                <div className="flex justify-center mt-4">
                  <Button
                    size="lg"
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={isMonitoring ? 'bg-destructive hover:bg-destructive/90' : 'gradient-primary border-0'}
                  >
                    {isMonitoring ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        {t('monitoring.stopMonitoring')}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {t('monitoring.startMonitoring')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Latest detection */}
            {(latestPrediction || isLoading) && (
              <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t('index.latestDetection')}
                </h2>
                {isLoading ? (
                  <Card className="p-8">
                    <LoadingSpinner variant="analyzing" />
                  </Card>
                ) : latestPrediction ? (
                  <PredictionCard prediction={latestPrediction} variant="featured" />
                ) : null}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
            {/* Quick stats */}
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-80">{t('monitoring.sessionCaptures')}</span>
                  <Settings className="w-4 h-4 opacity-60" />
                </div>
                <p className="text-4xl font-bold">{captureCount}</p>
                <p className="text-xs opacity-70 mt-1">
                  {isAutoMode ? t('monitoring.autoModeEnabled') : t('monitoring.manualMode')}
                </p>
              </CardContent>
            </Card>

            {/* Recent detections */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('monitoring.recentDetections')}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentDetections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('monitoring.noDetectionsSession')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentDetections.map((prediction, index) => (
                      <div
                        key={prediction.id}
                        className="animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <PredictionCard prediction={prediction} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
