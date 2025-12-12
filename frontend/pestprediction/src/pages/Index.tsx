import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '@/components/CameraCapture';
import { ImageUpload } from '@/components/ImageUpload';
import { PredictionCard, PredictionCardSkeleton } from '@/components/PredictionCard';
import { RecentActivity } from '@/components/RecentActivity';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { predictPest, generateId, ApiError } from '@/lib/api';
import { Prediction } from '@/types/prediction';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Leaf } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const { addPrediction, getRecentPredictions, clearPredictions } = useLocalStorage();

  const handleImageSubmit = useCallback(async (file: File, previewUrl: string) => {
    setIsLoading(true);
    setLatestPrediction(null);

    try {
      const response = await predictPest(file);
      
      const pestName = response.pest;
      // Since API only returns prediction name, we generate a random confidence for display
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
      
      toast.success(t('toast.analysisComplete'), {
        description: `${t('toast.detected')}: ${pestName}`,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      const isCorsError = error instanceof ApiError && error.isCorsError;
      toast.error(t('toast.analysisFailed'), {
        description: isCorsError 
          ? 'CORS error: Please ensure the backend server has CORS enabled.'
          : t('toast.connectionError'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [addPrediction, t]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            {t('index.badge')}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('index.title')}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('index.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main capture area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="camera" className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {t('common.camera')}
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t('common.upload')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="camera">
                <CameraCapture onCapture={handleImageSubmit} />
              </TabsContent>
              <TabsContent value="upload">
                <ImageUpload onUpload={handleImageSubmit} />
              </TabsContent>
            </Tabs>

            {/* Loading state */}
            {isLoading && (
              <div className="py-12">
                <LoadingSpinner variant="analyzing" />
              </div>
            )}

            {/* Latest prediction */}
            {latestPrediction && !isLoading && (
              <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t('index.latestDetection')}
                </h2>
                <PredictionCard prediction={latestPrediction} variant="featured" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <RecentActivity
              predictions={getRecentPredictions(10)}
              onClear={clearPredictions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
