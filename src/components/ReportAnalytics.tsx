import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Users, 
  Calendar,
  Target,
  Activity,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  hackTypeDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyTrends: Array<{ date: string; reports: number; votes: number }>;
  credibilityStats: Array<{ category: string; count: number }>;
  hourlyActivity: Array<{ hour: number; reports: number }>;
}

export const ReportAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    hackTypeDistribution: [],
    weeklyTrends: [],
    credibilityStats: [],
    hourlyActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const hackTypeColors = {
    aimbot: '#ef4444',
    wallhack: '#f97316', 
    speedhack: '#eab308',
    autoshoot: '#22c55e',
    teleport: '#06b6d4',
    god_mode: '#8b5cf6',
    unlimited_ammo: '#ec4899',
    other: '#6b7280'
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      // Fetch reports within time range
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!reports) return;

      // Process hack type distribution
      const hackTypeCounts = reports.reduce((acc, report) => {
        acc[report.hack_type] = (acc[report.hack_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hackTypeDistribution = Object.entries(hackTypeCounts).map(([type, count]) => ({
        name: type.replace('_', ' ').toUpperCase(),
        value: count,
        color: hackTypeColors[type as keyof typeof hackTypeColors] || '#6b7280'
      }));

      // Process weekly trends
      const weeklyData = new Map<string, { reports: number; votes: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        weeklyData.set(dateStr, { reports: 0, votes: 0 });
      }

      reports.forEach(report => {
        const dateStr = report.created_at.split('T')[0];
        if (weeklyData.has(dateStr)) {
          const data = weeklyData.get(dateStr)!;
          data.reports += 1;
          data.votes += report.upvotes + report.downvotes;
        }
      });

      const weeklyTrends = Array.from(weeklyData.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reports: data.reports,
        votes: data.votes
      }));

      // Process credibility stats
      const highCredibility = reports.filter(r => r.upvotes >= 5 && r.upvotes > r.downvotes * 2).length;
      const mediumCredibility = reports.filter(r => r.upvotes > r.downvotes && r.upvotes < 5).length;
      const lowCredibility = reports.filter(r => r.upvotes <= r.downvotes).length;

      const credibilityStats = [
        { category: 'High Credibility', count: highCredibility },
        { category: 'Medium Credibility', count: mediumCredibility },
        { category: 'Low Credibility', count: lowCredibility }
      ];

      // Process hourly activity
      const hourlyData = new Array(24).fill(0).map((_, hour) => ({ hour, reports: 0 }));
      
      reports.forEach(report => {
        const hour = new Date(report.created_at).getHours();
        hourlyData[hour].reports += 1;
      });

      setAnalytics({
        hackTypeDistribution,
        weeklyTrends,
        credibilityStats,
        hourlyActivity: hourlyData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="gaming-card p-8 text-center">
        <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-lg font-medium">Loading analytics...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gaming-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
              Report Analytics
            </h2>
            <p className="text-muted-foreground">Comprehensive insights into community reports</p>
          </div>
          
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-primary" : "border-primary/30"}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hack Type Distribution */}
        <Card className="gaming-card">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Hack Type Distribution</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.hackTypeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.hackTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Trends */}
        <Card className="gaming-card">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Activity Trends</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Credibility Stats */}
        <Card className="gaming-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Report Credibility</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.credibilityStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="category" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Activity */}
        <Card className="gaming-card">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Hourly Activity</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  content={<CustomTooltip />}
                  labelFormatter={(hour) => `${hour}:00`}
                />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="gaming-card">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Key Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">
              {analytics.hackTypeDistribution.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </div>
          
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {analytics.credibilityStats.find(s => s.category === 'High Credibility')?.count || 0}
            </div>
            <div className="text-sm text-muted-foreground">High Credibility</div>
          </div>
          
          <div className="text-center p-4 bg-orange-500/10 rounded-lg">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {analytics.hackTypeDistribution.find(h => h.name === 'AIMBOT')?.value || 0}
            </div>
            <div className="text-sm text-muted-foreground">Aimbot Reports</div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.max(...analytics.hourlyActivity.map(h => h.reports))}
            </div>
            <div className="text-sm text-muted-foreground">Peak Hour Reports</div>
          </div>
        </div>
      </Card>
    </div>
  );
};