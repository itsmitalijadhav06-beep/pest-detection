import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Bug,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { DetectionCard } from '@/components/DetectionCard';
import { analyticsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

/* ================= TYPES ================= */

interface Stats {
  total: number;
  high: number;
  medium: number;
  low: number;
}

interface Detection {
  id: string;
  pestName: string;
  confidence: number;
  risk: 'high' | 'medium' | 'low'; // ✅ 
  timestamp: string;
  imageUrl?: string;
}

interface PestCount {
  pestName: string;
  count: number;
}

/* ================= HELPERS ================= */

const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

/* ================= STAT CARD ================= */

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  variant: 'primary' | 'destructive' | 'warning' | 'success';
}) => {
  const variants = {
    primary: 'bg-emerald-900 text-white',
    destructive: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    success: 'bg-green-600 text-white',
  };

  return (
    <Card className={`p-5 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-4xl font-bold mt-1">{value}</p>
          <p className="text-sm opacity-80">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

/* ================= DASHBOARD ================= */

export const Dashboard = () => {
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);
  const [pestCounts, setPestCounts] = useState<PestCount[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /* ================= FETCH ================= */

  const fetchData = async () => {
  try {
    const [
      statsRes,
      monthlyRes,
      yearlyRes,
      recentRes,
      dailyRes, // ✅ NEW
    ] = await Promise.all([
      analyticsApi.getStats(),
      analyticsApi.getMonthly(),
      analyticsApi.getYearly(),
      analyticsApi.getRecent(),
      analyticsApi.getdaily(), // ✅ FETCH DAILY
    ]);

    setStats(statsRes.data);

    setMonthlyData(
      monthlyRes.data.map((m: any) => ({
        ...m,
        monthLabel: formatMonth(m.month),
      }))
    );

    setYearlyData(yearlyRes.data);

    setRecentDetections(
  recentRes.data.map((d: any) => ({
    id: d._id,
    pestName: d.pestName,
    confidence: d.confidence <= 1 ? d.confidence * 100 : d.confidence,
    risk: d.risk, // ✅ PASS BACKEND VALUE
    timestamp: new Date(d.createdAt).toLocaleString(),
    imageUrl: d.imageUrl,
  }))
);


    // ✅ DAILY ANALYSIS FROM BACKEND
    setPestCounts(
      dailyRes.data.map((p: any) => ({
        pestName: p.pestName,
        count: p.count,
      }))
    );

    setLastRefresh(new Date());
  } catch {
    toast({
      title: "Error",
      description: "Failed to load dashboard data",
      variant: "destructive",
    });
  }
};

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasHighRisk = stats.high > 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <Activity className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold">Early Warning Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time pest activity and risk assessment
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh ({lastRefresh.toLocaleTimeString()})
          </Button>
        </div>

        {/* Alert */}
        {hasHighRisk && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle />
              <div>
                <p className="font-semibold">High Risk Alert</p>
                <p className="text-sm">
                  Immediate intervention recommended for detected pests
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Detections" value={stats.total} subtitle="All time" icon={Bug} variant="primary" />
          <StatCard title="High Risk" value={stats.high} subtitle="Immediate action" icon={AlertCircle} variant="destructive" />
          <StatCard title="Medium Risk" value={stats.medium} subtitle="Close monitoring" icon={AlertTriangle} variant="warning" />
          <StatCard title="Low Risk" value={stats.low} subtitle="Stable condition" icon={CheckCircle} variant="success" />
        </div>

        {/* Charts + Side */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Monthly Pest Detection Summary
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#14532d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Annual Pest Detection Trend
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">

            {/* Recent */}
            <Card className="p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold flex gap-2 items-center">
                  <Clock className="w-4 h-4" /> Recent Detections
                </h3>
                <span className="text-xs text-green-600 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" /> Live
                </span>
              </div>

              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {recentDetections.map(d => (
  <DetectionCard
    key={d.id}
    pestName={d.pestName}
    confidence={d.confidence}
    risk={d.risk}          // ✅ REQUIRED
    timestamp={d.timestamp}
    imageUrl={d.imageUrl}
    compact
  />
))
}
              </div>
            </Card>

            {/* Daily Pest Analysis */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Daily Pest Analysis</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Distribution of pests detected today
              </p>

              <ul className="space-y-2 text-sm">
                {pestCounts.map(p => (
                  <li key={p.pestName} className="flex justify-between border-b pb-1">
                    <span className="capitalize">
                      {p.pestName.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold">{p.count}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Quick Recommendations */}
            <Card className="p-4 bg-emerald-900 text-white">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Quick Recommendations</h3>
                  <p className="text-xs opacity-80">
                    Actionable guidance for pest management
                  </p>
                </div>
              </div>

              <div className="bg-white text-emerald-900 rounded-lg p-4">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Inspect affected crops immediately</li>
                  <li>Apply recommended pest control measures</li>
                  <li>Monitor crop condition daily</li>
                  <li>Maintain proper irrigation & field hygiene</li>
                  <li>Consult an agricultural expert if spread increases</li>
                </ol>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};
