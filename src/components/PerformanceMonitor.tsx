import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  isOnline: boolean;
  connectionType: string;
  memoryUsage?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    isOnline: navigator.onLine,
    connectionType: 'unknown'
  });
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now();
    
    // Get connection info
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || connection.type : 'unknown';
    
    // Get memory usage (if available)
    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : undefined;
    
    setMetrics({
      loadTime: Math.round(loadTime),
      isOnline: navigator.onLine,
      connectionType,
      memoryUsage: memoryUsage ? Math.round(memoryUsage) : undefined
    });

    // Listen for online/offline events
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Show metrics in development or when performance is poor
    if (process.env.NODE_ENV === 'development' || loadTime > 3000) {
      setShowMetrics(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showMetrics) return null;

  const getPerformanceColor = (loadTime: number) => {
    if (loadTime < 1000) return 'bg-green-500';
    if (loadTime < 3000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case '4g': return 'text-green-400';
      case '3g': return 'text-yellow-400';
      case '2g': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="gaming-card p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Performance</span>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Load Time:</span>
            <Badge className={`${getPerformanceColor(metrics.loadTime)} text-white`}>
              {metrics.loadTime}ms
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Connection:</span>
            <div className="flex items-center gap-1">
              {metrics.isOnline ? (
                <Wifi className="h-3 w-3 text-green-400" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-400" />
              )}
              <span className={getConnectionColor(metrics.connectionType)}>
                {metrics.connectionType.toUpperCase()}
              </span>
            </div>
          </div>
          
          {metrics.memoryUsage && (
            <div className="flex items-center justify-between">
              <span>Memory:</span>
              <Badge variant="outline" className="text-xs">
                {metrics.memoryUsage}MB
              </Badge>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-primary">Optimized</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};