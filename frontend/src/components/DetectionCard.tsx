import { Bug, Clock, Percent } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { Card } from '@/components/ui/card';

interface DetectionCardProps {
  pestName: string;
  confidence: number;
  risk: 'high' | 'medium' | 'low';   // ✅ ADD RISK
  timestamp: string;
  imageUrl?: string;
  compact?: boolean;
}

export const DetectionCard = ({
  pestName,
  confidence,
  risk,
  timestamp,
  imageUrl,
  compact = false,
}: DetectionCardProps) => {

  /* ================= COMPACT CARD ================= */
  if (compact) {
    return (
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">

          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={pestName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Bug className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-sm truncate">
                {pestName.replace(/_/g, ' ')}
              </span>
            </div>

            {/* ✅ USE BACKEND RISK */}
            <RiskBadge risk={risk} className="mb-1.5" />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {confidence.toFixed(1)}% confidence
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timestamp}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* ================= FULL CARD ================= */
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <div className="flex flex-col sm:flex-row">

        <div className="w-full sm:w-48 h-40 bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={pestName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Bug className="w-12 h-12 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-lg">
              {pestName.replace(/_/g, ' ')}
            </h3>
          </div>

          {/* ✅ USE BACKEND RISK */}
          <RiskBadge risk={risk} className="mb-3" />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Percent className="w-4 h-4" />
              {confidence.toFixed(1)}% confidence
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
