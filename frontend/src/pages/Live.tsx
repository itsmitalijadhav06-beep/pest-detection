import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Zap, Play, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/layout/AppLayout';
import { DetectionCard } from '@/components/DetectionCard';
import { PestInfoTabs } from '@/components/PestInfoTabs';
import { useToast } from '@/hooks/use-toast';
import { predictApi, alertApi, analyticsApi } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import i18n from "@/lib/i18n";

interface Detection {
  id: string;
  pestName: string;
  confidence: number;
  risk: 'high' | 'medium' | 'low';
  timestamp: string;
  imageUrl?: string;
}

const formatIST = (date: string | Date) =>
  new Date(
    typeof date === 'string' ? date + 'Z' : date.toISOString()
  ).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const Live = () => {
  const { t } = useTranslation();

  const [cameraActive, setCameraActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [latestDetection, setLatestDetection] = useState<Detection | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchRecentFromDB = async () => {
    try {
      const res = await analyticsApi.getRecent();
      const mapped = res.data.slice(0, 3).map((d: any) => ({
        id: d._id,
        pestName: d.pestName,
        confidence: d.confidence * 100,
        risk: d.risk,
        timestamp: formatIST(d.createdAt),
        imageUrl: d.imageUrl,
      }));
      setRecentDetections(mapped);
    } catch {
      console.warn('Failed to load recent detections');
    }
  };

  useEffect(() => {
    fetchRecentFromDB();
    const poll = setInterval(fetchRecentFromDB, 3000);
    return () => clearInterval(poll);
  }, []);

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
        title: t("cameraError"),
        description: t("cameraErrorDesc"),
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
const data = res.data;

// 🔥 Handle low-confidence case
if (data.status === "uncertain") {
  console.log("Low confidence frame ignored");

  // Optional: show small toast (not destructive)
  toast({
    title: "Low Confidence",
    description: data.message,
  });

  return; // STOP execution — do not create detection
}

const detection: Detection = {
  id: data._id ?? Date.now().toString(),
  pestName: data.pestName,
  confidence: data.confidence * 100,
  risk: data.risk,
  timestamp: formatIST(new Date()),
  imageUrl: canvas.toDataURL('image/jpeg'),
};

        setLatestDetection(detection);
        setRecentDetections((prev) => [detection, ...prev].slice(0, 3));
        setCaptureCount((c) => c + 1);

        if (res.data.risk === 'high') {
          await alertApi.sendEmail({
            pest_name: res.data.pestName,
            confidence: detection.confidence,
          });

          toast({
            title: t("highRiskDetected"),
            description: t("highRiskDetectedDesc", {
              pestName: res.data.pestName,
              confidence: detection.confidence.toFixed(2),
            }),
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Prediction failed', err);
      }
    }, 'image/jpeg');
  }, [cameraActive, videoReady, toast, t]);

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

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("liveTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("liveSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
            <Zap className="w-4 h-4" />
            <span className="text-sm">{t("autoMode")}</span>
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
                      {t("openCamera")}
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
                  {t("startMonitoring")}
                </Button>

                <Button
                  variant="outline"
                  className="border-green-800 text-green-800"
                  onClick={stopCamera}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {t("cameraOff")}
                </Button>
              </div>

              {latestDetection && (
                <>
                  <DetectionCard {...latestDetection} />
                  <PestInfoTabs
                    pestName={latestDetection.pestName}
                    language={i18n.language as "en" | "hi" | "mr"}
                  />
                </>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-green-800 text-white p-4">
              <h3 className="font-semibold">{t("sessionCaptures")}</h3>
              <p className="text-3xl font-bold mt-1">{captureCount}</p>
              <p className="text-sm opacity-80">
                {autoMode
                  ? t("autoCaptureMode")
                  : t("manualCaptureMode")}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">
                {t("recentDetections")}
              </h3>
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