import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { StatsCard } from '@/components/StatsCard';
import { PredictionCard } from '@/components/PredictionCard';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  AlertTriangle, 
  Shield, 
  Activity, 
  RefreshCw,
  Clock,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { RiskLevel } from '@/types/prediction';

export default function Dashboard() {
  const { t } = useTranslation();
  const { predictions, getStats, getRecentPredictions } = useLocalStorage();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const stats = getStats();
  const recentPredictions = getRecentPredictions(20);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getOverallRisk = (): RiskLevel => {
    if (stats.highRiskCount > 0) return 'danger';
    if (stats.mediumRiskCount > 2) return 'warning';
    return 'safe';
  };

  const overallRisk = getOverallRisk();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.title')}</h1>
            </div>
            <p className="text-muted-foreground">
              {t('dashboard.description')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {t('common.autoRefresh')}: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
            </div>
            <Button variant="outline" onClick={() => setLastRefresh(new Date())}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <Card className={`mb-6 animate-fade-up border-2 ${
          overallRisk === 'danger' ? 'border-destructive/50 bg-destructive/5' :
          overallRisk === 'warning' ? 'border-warning/50 bg-warning/5' :
          'border-success/50 bg-success/5'
        }`} style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <StatusIndicator level={overallRisk} size="lg" />
                <div>
                  <h2 className="text-xl font-bold">
                    {overallRisk === 'danger' ? t('dashboard.overallStatus.highRisk') :
                     overallRisk === 'warning' ? t('dashboard.overallStatus.caution') :
                     t('dashboard.overallStatus.safe')}
                  </h2>
                  <p className="text-muted-foreground">
                    {overallRisk === 'danger' ? t('dashboard.overallDescription.highRisk') :
                     overallRisk === 'warning' ? t('dashboard.overallDescription.caution') :
                     t('dashboard.overallDescription.safe')}
                  </p>
                </div>
              </div>
              <StatusIndicator level={overallRisk} showLabel />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title={t('dashboard.stats.totalDetections')}
              value={stats.totalDetections}
              subtitle={t('dashboard.stats.allTime')}
              icon={Bug}
              variant="primary"
            />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <StatsCard
              title={t('dashboard.stats.highRisk')}
              value={stats.highRiskCount}
              subtitle={t('dashboard.stats.immediateAttention')}
              icon={AlertTriangle}
              variant="danger"
            />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title={t('dashboard.stats.mediumRisk')}
              value={stats.mediumRiskCount}
              subtitle={t('dashboard.stats.monitorClosely')}
              icon={TrendingUp}
              variant="warning"
            />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
            <StatsCard
              title={t('dashboard.stats.lowRisk')}
              value={stats.lowRiskCount}
              subtitle={t('dashboard.stats.underControl')}
              icon={Shield}
              variant="success"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detection Feed */}
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('dashboard.recentDetections')}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {t('common.live')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {recentPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <Leaf className="w-16 h-16 mx-auto text-success/30 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('dashboard.allClear')}</h3>
                    <p className="text-muted-foreground">
                      {t('dashboard.noPests')}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {recentPredictions.map((prediction, index) => (
                        <div
                          key={prediction.id}
                          className="animate-slide-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <PredictionCard prediction={prediction} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '350ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('dashboard.riskDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* High Risk */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIndicator level="danger" size="sm" />
                        <span className="text-sm font-medium">{t('status.highRisk')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.highRiskCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-danger transition-all duration-500"
                        style={{ width: `${stats.totalDetections > 0 ? (stats.highRiskCount / stats.totalDetections) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium Risk */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIndicator level="warning" size="sm" />
                        <span className="text-sm font-medium">{t('status.mediumRisk')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.mediumRiskCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-warning transition-all duration-500"
                        style={{ width: `${stats.totalDetections > 0 ? (stats.mediumRiskCount / stats.totalDetections) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Low Risk */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIndicator level="safe" size="sm" />
                        <span className="text-sm font-medium">{t('status.lowRisk')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.lowRiskCount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-safe transition-all duration-500"
                        style={{ width: `${stats.totalDetections > 0 ? (stats.lowRiskCount / stats.totalDetections) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gradient-hero text-primary-foreground">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">{t('dashboard.quickActions')}</h3>
                <p className="text-sm opacity-80 mb-4">
                  {t('dashboard.quickActionsDesc')}
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" size="sm">
                    <Bug className="w-4 h-4 mr-2" />
                    {t('dashboard.viewPestGuide')}
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    {t('dashboard.preventionTips')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{t('dashboard.lastUpdated')}</p>
                    <p className="font-medium">{format(lastRefresh, 'MMM d, yyyy HH:mm:ss')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
