import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, SwitchCamera, X, Aperture } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose?: () => void;
  autoCapture?: boolean;
  autoCaptureInterval?: number;
}

export function CameraCapture({ onCapture, onClose, autoCapture = false, autoCaptureInterval = 15000 }: CameraCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError(t('camera.accessDenied'));
      setIsActive(false);
    }
  }, [facingMode, t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const previewUrl = canvas.toDataURL('image/jpeg');
          onCapture(file, previewUrl);
        }
      }, 'image/jpeg', 0.9);
    }
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    }
  }, [facingMode, isActive, startCamera]);

  useEffect(() => {
    if (autoCapture && isActive) {
      const interval = setInterval(() => {
        captureImage();
      }, autoCaptureInterval);
      return () => clearInterval(interval);
    }
  }, [autoCapture, isActive, autoCaptureInterval, captureImage]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!isActive) {
    return (
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('camera.startCamera')}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t('camera.takePhoto')}
          </p>
          <Button onClick={startCamera} className="gradient-primary border-0">
            <Camera className="w-4 h-4 mr-2" />
            {t('camera.openCamera')}
          </Button>
          {error && <p className="text-destructive text-sm mt-4">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay controls */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex justify-between">
            <Button
              variant="secondary"
              size="icon"
              className="glass"
              onClick={switchCamera}
            >
              <SwitchCamera className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button
                variant="secondary"
                size="icon"
                className="glass"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full gradient-primary shadow-glow"
              onClick={captureImage}
            >
              <Aperture className="w-8 h-8" />
            </Button>
          </div>
        </div>

        {autoCapture && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {t('camera.autoCaptureActive')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
