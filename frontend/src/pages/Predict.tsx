import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, ImageIcon, Trash2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { DetectionCard } from '@/components/DetectionCard';
import { PestInfoTabs } from '@/components/PestInfoTabs';
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

/* ===============================
   IST FORMATTER (SINGLE SOURCE)
=============================== */
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


export const Predict = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [latestDetection, setLatestDetection] = useState<Detection | null>(null);
  const [recentActivity, setRecentActivity] = useState<Detection[]>([]);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  /* ===============================
     USERNAME
  =============================== */
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const username =
    storedUser?.username ||
    storedUser?.name ||
    storedUser?.user?.username ||
    'User';

  /* ===============================
     FETCH RECENT ACTIVITY
  =============================== */
  const fetchRecentActivity = async () => {
    try {
      const res = await analyticsApi.getRecent();
      setRecentActivity(
        res.data.map((d: any) => ({
          id: d._id,
          pestName: d.pestName,
          confidence: d.confidence * 100,
          risk: d.risk,
          imageUrl: d.imageUrl,
          timestamp: formatIST(d.createdAt),
        }))
      );
    } catch {
      console.error('Failed to load recent predictions');
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  /* ===============================
     FILE HANDLING
  =============================== */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  /* ===============================
     CAMERA
  =============================== */
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  /* ===============================
     PREDICT
  =============================== */
  const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await predictApi.predict(formData);
      const confidencePercent = res.data.confidence * 100;

      const detection: Detection = {
        id: res.data._id,
        pestName: res.data.pestName,
        confidence: confidencePercent,
        risk: res.data.risk,
        timestamp: formatIST(new Date()),
        imageUrl: res.data.imageUrl,
      };

      setLatestDetection(detection);
      await fetchRecentActivity();

      if (res.data.risk === 'high') {
        await alertApi.sendEmail({
          pest_name: res.data.pestName,
          confidence: confidencePercent,
        });

        toast({
          title: '⚠️ High Risk Detected',
          description: `${res.data.pestName} detected (${confidencePercent.toFixed(
            1
          )}%)`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Detection successful',
          description: `${res.data.pestName} detected (${confidencePercent.toFixed(
            1
          )}%)`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Prediction failed',
        description: err.message || 'Server error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ===============================
     UI
  =============================== */
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            AI-Powered Pest Detection
          </span>

          <h1 className="text-3xl font-bold">
            Welcome back, {username} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Identify pests instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={activeTab === 'camera' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('camera');
                  startCamera();
                }}
              >
                <Camera className="mr-2 w-4 h-4" /> Camera
              </Button>
              <Button
                className="flex-1"
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('upload');
                  stopCamera();
                }}
              >
                <Upload className="mr-2 w-4 h-4" /> Upload
              </Button>
            </div>

            <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              <div className="p-6">
                {activeTab === 'camera' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="rounded-lg max-h-80 mx-auto w-full bg-black"
                  />
                ) : selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      className="rounded-lg max-h-80 mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center py-12 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-10 h-10 mb-3" />
                    <p>Click or drag image</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                />
              </div>
            </Card>

            {selectedImage && (
              <Button
                className="w-full"
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? 'Analyzing…' : 'Analyze Image'}
              </Button>
            )}

            {latestDetection && (
              <>
                <DetectionCard {...latestDetection} />
                <PestInfoTabs pestName={latestDetection.pestName} />
              </>
            )}
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            {recentActivity.length ? (
              recentActivity.map((d) => (
                <DetectionCard key={d.id} {...d} compact />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No recent detections
              </p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
