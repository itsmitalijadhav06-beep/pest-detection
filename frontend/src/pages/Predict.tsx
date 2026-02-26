import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, ImageIcon, Trash2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { DetectionCard } from '@/components/DetectionCard';
import { PestInfoTabs } from '@/components/PestInfoTabs';
import { useToast } from '@/hooks/use-toast';
import { predictApi, alertApi, analyticsApi } from '@/lib/api';
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

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
  const { t } = useTranslation();

 const speakAlert = (text: string, language: string) => {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();

  let selectedVoice;

  if (language === "hi") {
    selectedVoice = voices.find(v => v.lang.includes("hi"));
  } 
  else if (language === "mr") {
    selectedVoice = voices.find(v => v.lang.includes("mr"));
  } 
  else {
    selectedVoice = voices.find(v => v.lang.includes("en"));
  }

  // 🔥 Break into smaller sentences
  const sentences = text.split(/[.!?]/);

  sentences.forEach((sentence) => {
    if (sentence.trim() === "") return;

    const speech = new SpeechSynthesisUtterance(sentence.trim());

    if (selectedVoice) speech.voice = selectedVoice;

    if (language === "hi") speech.lang = "hi-IN";
    else if (language === "mr") speech.lang = "mr-IN";
    else speech.lang = "en-US";

    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  });
};
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

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const username =
    storedUser?.username ||
    storedUser?.name ||
    storedUser?.user?.username ||
    'User';

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t("fileTooLarge"),
        description: t("fileTooLargeDesc"),
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

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(blob));
      stopCamera();
      setActiveTab('upload');
    }, 'image/jpeg');
  };

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

  const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await predictApi.predict(formData);
const data = res.data;

// 🔥 Handle Low Confidence Case
if (data.status === "uncertain") {
  setLatestDetection(null); // clear previous result

  toast({
    title: "Low Confidence",
    description: data.message,
    variant: "destructive",
  });

  setLoading(false);
  return;
}

const confidencePercent = data.confidence * 100;

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
    language: i18n.language,
  });

  // 🔊 SPEAK ALERT
  // 🔥 Format pest name properly for speech
// 🔥 Format pest name properly
const formattedPestName = res.data.pestName
  .replace(/_/g, " ")
  .replace(/\b\w/g, (char: string) => char.toUpperCase());

// 🔊 Speak based on language (SHORT SENTENCES for stability)
if (i18n.language === "hi") {
  speakAlert(
    `उच्च जोखिम कीट पाया गया। कीट का नाम ${formattedPestName}। कृपया तुरंत कार्रवाई करें।`,
    "hi"
  );
}
else if (i18n.language === "mr") {
  speakAlert(
    `उच्च जोखीम कीड आढळली। कीडचे नाव ${formattedPestName}। कृपया त्वरित कारवाई करा।`,
    "mr"
  );
}
else {
  speakAlert(
    `High risk pest detected. Pest name ${formattedPestName}. Please take immediate action.`,
    "en"
  );
}
  toast({
    title: t("highRiskDetected"),
    description: t("highRiskDetectedDesc", {
      pestName: formattedPestName,
      confidence: confidencePercent.toFixed(1),
    }),
    variant: 'destructive',
  });
} else {
        toast({
          title: t("detectionSuccess"),
          description: t("detectionSuccessDesc", {
            pestName: res.data.pestName,
            confidence: confidencePercent.toFixed(1),
          }),
        });
      }
    } catch (err: any) {
      toast({
        title: t("predictionFailed"),
        description: err.message || t("serverError"),
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

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            {t("aiPestDetection")}
          </span>

          <h1 className="text-3xl font-bold">
            {t("identifyPestsTitle")}, {username} 👋
          </h1>

          <p className="text-muted-foreground mt-1">
            {t("identifyPestsTitle")}
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
                <Camera className="mr-2 w-4 h-4" /> {t("cameraTab")}
              </Button>

              <Button
                className="flex-1"
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('upload');
                  stopCamera();
                }}
              >
                <Upload className="mr-2 w-4 h-4" /> {t("uploadTab")}
              </Button>
            </div>

            <Card onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              <div className="p-6">
                {activeTab === 'camera' ? (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="rounded-lg max-h-80 mx-auto w-full bg-black"
                    />

                    <Button className="w-full" onClick={captureImage}>
                      {t("capturePhoto")}
                    </Button>
                  </div>
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
                    <p>{t("clickOrDragImage")}</p>
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
                {loading ? t("analyzing") : t("analyzeImage")}
              </Button>
            )}

   {latestDetection && (
  <>
    <DetectionCard {...latestDetection} />

    {/* 🔊 Voice Button */}
    <Button
      className="w-full mt-2"
      variant="outline"
      onClick={() => {
        const formattedPestName = latestDetection.pestName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char: string) => char.toUpperCase());

        speakAlert(
          t("voice_high_risk", {
            pestName: formattedPestName,
          }),
          i18n.language
        );
      }}
    >
      🔊 {t("playVoiceAlert")}
    </Button>

    <PestInfoTabs
      pestName={latestDetection.pestName}
      language={i18n.language as "en" | "hi" | "mr"}
    />
  </>
)}         </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-semibold">
                {t("recentActivity")}
              </h3>
            </div>

            {recentActivity.length ? (
              recentActivity.map((d) => (
                <DetectionCard key={d.id} {...d} compact />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("noRecent")}
              </p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};