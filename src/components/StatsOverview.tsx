import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DetailedStats {
  totalReports: number;
  totalVotes: number;
  suspiciousReports: number;
  recentReports24h: number;
  verifiedReports: number;
  falseReports: number;
  activeUsers: number;
  weeklyTrend: number;
}

export const StatsOverview = () => {
  const [stats, setStats] = useState<DetailedStats>({
    totalReports: 0,
    totalVotes: 0,
    suspiciousReports: 0,
    recentReports24h: 0,
    verifiedReports: 0,
    falseReports: 0,
    activeUsers: 0,
    weeklyTrend: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        // Fetch all reports
        const { data: allReports, count: totalReports } = await supabase
          .from('reports')
          .select('*', { count: 'exact' });

        // Fetch total votes
        const { count: totalVotes } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true });

        // Fetch suspicious reports (high upvote ratio)
        const suspiciousReports = allReports?.filter(report => 
          report.upvotes > report.downvotes && report.upvotes > 2
        ).length || 0;

        // Fetch recent reports (last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { data: recentReports } = await supabase
          .from('reports')
          .select('*')
          .gte('created_at', yesterday.toISOString());

        // Calculate verified reports (high confidence)
        const verifiedReports = allReports?.filter(report => 
          report.upvotes >= 5 && (report.upvotes / Math.max(report.downvotes, 1)) >= 3
        ).length || 0;

        // Calculate false reports (high downvote ratio)
        const falseReports = allReports?.filter(report => 
          report.downvotes > report.upvotes && report.downvotes > 2
        ).length || 0;

        // Calculate weekly trend
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weeklyReports } = await supabase
          .from('reports')
          .select('*')
          .gte('created_at', weekAgo.toISOString());

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const { data: previousWeekReports } = await supabase
          .from('reports')
          .select('*')
          .gte('created_at', twoWeeksAgo.toISOString())
          .lt('created_at', weekAgo.toISOString());

        const weeklyTrend = weeklyReports && previousWeekReports 
          ? ((weeklyReports.length - previousWeekReports.length) / Math.max(previousWeekReports.length, 1)) * 100
          : 0;

        setStats({
          totalReports: totalReports || 0,
          totalVotes: totalVotes || 0,
          suspiciousReports,
          recentReports24h: recentReports?.length || 0,
          verifiedReports,
          falseReports,
          activeUsers: Math.floor((totalVotes || 0) / 3), // Estimate active users
          weeklyTrend: Math.round(weeklyTrend)
        });
      } catch (error) {
        console.error('Error fetching detailed stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedStats();
    
    // Set up real-time updates
    const interval = setInterval(fetchDetailedStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    description, 
    color, 
    trend,
    isLoading: cardLoading 
  }: {
    icon: any;
    label: string;
    value: string | number;
    description: string;
    color: string;
    trend?: number;
    isLoading?: boolean;
  }) => (
    <Card className="gaming-card text-center p-4 hover:scale-105 transition-all duration-300 relative overflow-hidden">
      {cardLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${color} relative`}>
        <Icon className="h-6 w-6 text-white" />
        {trend !== undefined && (
          <div className="absolute -top-1 -right-1">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-400" />
            ) : null}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend !== undefined && trend !== 0 && (
          <Badge 
            variant={trend > 0 ? "default" : "destructive"} 
            className="text-xs px-2 py-0.5"
          >
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
          Community Impact Dashboard
        </h2>
        <p className="text-muted-foreground">Real-time statistics updated every 30 seconds</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Shield}
          label="Total Reports"
          value={stats.totalReports}
          description="Community submissions"
          color="bg-blue-500"
          trend={stats.weeklyTrend}
          isLoading={isLoading}
        />
        
        <StatCard
          icon={Users}
          label="Total Votes"
          value={stats.totalVotes}
          description="Community participation"
          color="bg-green-500"
          isLoading={isLoading}
        />
        
        <StatCard
          icon={AlertTriangle}
          label="High Risk"
          value={stats.suspiciousReports}
          description="Flagged by community"
          color="bg-red-500"
          isLoading={isLoading}
        />
        
        <StatCard
          icon={Clock}
          label="Recent (24h)"
          value={stats.recentReports24h}
          description="Latest reports"
          color="bg-orange-500"
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Verified Reports"
          value={stats.verifiedReports}
          description="High confidence reports"
          color="bg-emerald-500"
          isLoading={isLoading}
        />
        
        <StatCard
          icon={XCircle}
          label="False Reports"
          value={stats.falseReports}
          description="Community rejected"
          color="bg-gray-500"
          isLoading={isLoading}
        />
        
        <StatCard
          icon={Activity}
          label="Active Users"
          value={stats.activeUsers}
          description="Estimated participants"
          color="bg-purple-500"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};