import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload: (file: File, previewUrl: string) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string; // THIS is stored permanently
      setPreview(base64Url);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);  // convert file → Base64
  }
}, []);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = () => {
    if (selectedFile && preview) {
      onUpload(selectedFile, preview);
      clearPreview();
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
  };

  if (preview && selectedFile) {
    return (
      <Card className="overflow-hidden animate-scale-in">
        <CardContent className="p-0 relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="text-primary-foreground">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs opacity-80">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="glass"
                onClick={clearPreview}
              >
                <X className="w-4 h-4 mr-1" />
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                className="gradient-primary border-0"
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4 mr-1" />
                {t('common.analyze')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-all duration-200 cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
      )}
    >
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className="p-8 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <input {...getInputProps()} />
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all',
            isDragActive ? 'gradient-primary shadow-glow' : 'bg-secondary'
          )}>
            {isDragActive ? (
              <Upload className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Image className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-base font-semibold mb-1">
            {isDragActive ? t('upload.dropHere') : t('upload.title')}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {t('upload.dragDrop')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('upload.formats')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
