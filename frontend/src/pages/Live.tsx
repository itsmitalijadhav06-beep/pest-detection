import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Zap, Play, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/layout/AppLayout';
import { DetectionCard } from '@/components/DetectionCard';
import { useToast } from '@/hooks/use-toast';
import { predictApi, alertApi, analyticsApi } from '@/lib/api';

interface Detection {
  id: string;
  pestName: string;
  confidence: number;
  risk: 'high' | 'medium' | 'low';
  timestamp: string;
  imageUrl?: string;
}

export const Live = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [captureCount, setCaptureCount] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  /* =========================
     FETCH RECENT (MONGODB)
  ========================= */

  const fetchRecentFromDB = async () => {
    try {
      const res = await analyticsApi.getRecent();
      const mapped = res.data.slice(0, 3).map((d: any) => ({
        id: d._id,
        pestName: d.pestName,
        confidence: d.confidence * 100,
        risk: d.risk,
        timestamp: new Date(d.createdAt).toLocaleString(),
        imageUrl: d.imageUrl,
      }));
      setRecentDetections(mapped);
    } catch {
      console.warn('Failed to load recent detections');
    }
  };

  /* =========================
     ALWAYS SYNC FROM MONGODB
  ========================= */

  useEffect(() => {
    fetchRecentFromDB();
    const poll = setInterval(fetchRecentFromDB, 3000);
    return () => clearInterval(poll);
  }, []);

  /* =========================
     CAMERA CONTROL
  ========================= */

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };

      setCameraActive(true);
      setVideoReady(false);
    } catch {
      toast({
        title: 'Camera error',
        description: 'Please allow camera permission',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(track => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setIsMonitoring(false);
    setVideoReady(false);
  };

  /* =========================
     CAPTURE & ANALYZE
  ========================= */

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !cameraActive || !videoReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      try {
        const res = await predictApi.predict(formData);

        const detection: Detection = {
          id: res.data._id ?? Date.now().toString(),
          pestName: res.data.pestName,
          confidence: res.data.confidence * 100,
          risk: res.data.risk,
          timestamp: new Date(res.data.createdAt).toLocaleString(),
          imageUrl: canvas.toDataURL('image/jpeg'),
        };

        setRecentDetections((prev) => [detection, ...prev].slice(0, 3));
        setCaptureCount((c) => c + 1);

        if (res.data.risk === 'high') {
          await alertApi.sendEmail({
            pest_name: res.data.pestName,
            confidence: detection.confidence,
          });

          toast({
            title: '⚠️ High Risk Detected',
            description: `${res.data.pestName} detected`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Prediction failed', err);
      }
    }, 'image/jpeg');
  }, [cameraActive, videoReady, toast]);

  /* =========================
     AUTO MODE
  ========================= */

  useEffect(() => {
    if (!autoMode || !cameraActive || !isMonitoring || !videoReady) return;

    intervalRef.current = setInterval(captureAndAnalyze, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoMode, cameraActive, isMonitoring, videoReady, captureAndAnalyze]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  /* =========================
     UI (UNCHANGED)
  ========================= */

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Live Monitoring</h1>
            <p className="text-muted-foreground text-sm">
              Real-time pest detection with automatic capture
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            <Zap className="w-4 h-4" />
            <span className="text-sm">Auto Mode</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="aspect-video bg-muted relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={() => setVideoReady(true)}
                  className={`w-full h-full object-cover ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 mb-3" />
                    <Button
                      className="bg-green-800 hover:bg-green-900"
                      onClick={startCamera}
                    >
                      Open Camera
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 flex gap-2">
                <Button
                  className="flex-1 bg-green-800 hover:bg-green-900"
                  disabled={!cameraActive || !videoReady}
                  onClick={() => {
                    setCaptureCount(0);
                    setIsMonitoring(true);
                    setTimeout(captureAndAnalyze, 500);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>

                <Button
                  variant="outline"
                  className="border-green-800 text-green-800"
                  onClick={stopCamera}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Camera Off
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-green-800 text-white p-4">
              <h3 className="font-semibold">Session Captures</h3>
              <p className="text-3xl font-bold mt-1">{captureCount}</p>
              <p className="text-sm opacity-80">
                {autoMode ? 'Auto capture mode' : 'Manual capture mode'}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Recent Detections</h3>
              <div className="space-y-2">
                {recentDetections.map((d) => (
                  <DetectionCard key={d.id} {...d} compact />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
