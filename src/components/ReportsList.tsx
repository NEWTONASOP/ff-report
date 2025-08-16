import { useState, useEffect } from "react";
import { Clock, TrendingUp, Filter, Shield, Users, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ReportCard } from "./ReportCard";
import { Label } from "@/components/ui/label";

interface Report {
  id: string;
  ign: string;
  uid: string;
  hack_type: string;
  description: string;
  proof_urls: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
}

interface ReportsListProps {
  onUpdate?: () => void;
  hideControls?: boolean;
}

export const ReportsList = ({ onUpdate, hideControls = false }: ReportsListProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [hackTypeFilter, setHackTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalVotes: 0,
    suspiciousReports: 0,
    recentReports24h: 0
  });

  const ITEMS_PER_PAGE = 10;

  const hackTypes = [
    "aimbot",
    "wallhack",
    "speedhack", 
    "autoshoot",
    "teleport",
    "god_mode",
    "unlimited_ammo",
    "other"
  ];

  const loadReports = async (loadMore = false) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('*');

      // Apply hack type filter
      if (hackTypeFilter && hackTypeFilter !== "all") {
        query = query.eq('hack_type', hackTypeFilter);
      }

      // Apply sorting
      if (sortBy === "recent") {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('upvotes', { ascending: false });
      }

      // Apply pagination
      const startIndex = loadMore ? page * ITEMS_PER_PAGE : 0;
      query = query.range(startIndex, startIndex + ITEMS_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) throw error;

      const newReports = data || [];
      
      if (loadMore) {
        setReports(prev => [...prev, ...newReports]);
      } else {
        setReports(newReports);
        setPage(0);
      }

      setHasMore(newReports.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch total reports
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      // Fetch total votes
      const { count: votesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      // Fetch credible reports (upvotes > downvotes)
      const { data: credibleReports } = await supabase
        .from('reports')
        .select('*')
        .gt('upvotes', 'downvotes');

      // Fetch recent reports (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { data: recentReports } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', yesterday.toISOString());

      setStats({
        totalReports: reportsCount || 0,
        totalVotes: votesCount || 0,
        suspiciousReports: credibleReports?.length || 0,
        recentReports24h: recentReports?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    loadReports();
    loadStats();
  }, [sortBy, hackTypeFilter]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    setTimeout(() => loadReports(true), 100);
  };

  const StatCard = ({ icon: Icon, label, value, description, color, gradient }: {
    icon: any;
    label: string;
    value: string | number;
    description: string;
    color: string;
    gradient: string;
  }) => (
    <Card className="gaming-card text-center p-4 hover:scale-105 transition-transform duration-300">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${color} ${gradient}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-1">{value}</h3>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Enhanced Header with Stats - Only show when controls are visible */}
      {!hideControls && (
        <Card className="gaming-card relative overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-300/5" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
                  Community Reports
                </h2>
                <p className="text-sm text-muted-foreground">Browse and analyze hacker reports from the community</p>
              </div>
            </div>

            {/* Compact Stats Grid - Only show when controls are visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard
                icon={AlertTriangle}
                label="Total Reports"
                value={stats.totalReports.toLocaleString()}
                description="Community submissions"
                color="bg-blue-500"
                gradient=""
              />
              <StatCard
                icon={Users}
                label="Total Votes"
                value={stats.totalVotes.toLocaleString()}
                description="Community participation"
                color="bg-green-500"
                gradient=""
              />
              <StatCard
                icon={TrendingUp}
                label="Suspicious Reports"
                value={stats.suspiciousReports.toLocaleString()}
                description="Flagged by community"
                color="bg-red-500"
                gradient=""
              />
              <StatCard
                icon={Clock}
                label="Recent Reports"
                value={stats.recentReports24h}
                description="Last 24 hours"
                color="bg-orange-500"
                gradient=""
              />
            </div>

            {/* Filters and Controls - Only show when not hidden */}
            <div className="flex flex-col gap-3 items-start justify-between">
              <div className="flex flex-col gap-3 w-full">
                {/* Sort Control */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center space-x-2">
                    <BarChart3 className="h-3 w-3" />
                    <span>Sort By</span>
                  </Label>
                  <Select value={sortBy} onValueChange={(value: "recent" | "popular") => setSortBy(value)}>
                    <SelectTrigger className="gaming-input w-full sm:w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Recent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="popular">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Popular</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hack Type Filter */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center space-x-2">
                    <Filter className="h-3 w-3" />
                    <span>Hack Type</span>
                  </Label>
                  <Select value={hackTypeFilter} onValueChange={setHackTypeFilter}>
                    <SelectTrigger className="gaming-input w-full sm:w-[160px] h-9">
                      <SelectValue placeholder="All hack types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All hack types</SelectItem>
                      {hackTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy("recent");
                  setHackTypeFilter("all");
                }}
                className="border-primary/30 hover:bg-primary/10 h-9 w-full sm:w-auto"
              >
                <Filter className="h-3 w-3 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reports Display */}
      {reports.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {hackTypeFilter && hackTypeFilter !== "all" 
                  ? `${hackTypeFilter.replace('_', ' ').toUpperCase()} Reports` 
                  : 'Recent Reports'
                }
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>{reports.length} reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-red-400" />
                  <span>{reports.filter(r => r.upvotes > r.downvotes).length} suspicious</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpdate={onUpdate || (() => loadReports())}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 border-primary/30 hover:bg-primary/10"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Load More Reports
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && reports.length === 0 && (
        <Card className="gaming-card text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold mb-3">Loading Reports</h3>
          <p className="text-muted-foreground">Fetching the latest community reports...</p>
        </Card>
      )}

      {/* No Reports State */}
      {reports.length === 0 && !isLoading && (
        <Card className="gaming-card text-center py-16">
          <div className="p-4 bg-muted/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No Reports Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {hackTypeFilter && hackTypeFilter !== "all" 
              ? `No ${hackTypeFilter.replace('_', ' ')} reports found. Try adjusting your filters.`
              : "Be the first to report a hacker and help keep Free Fire fair!"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="gaming"
              className="px-8"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Submit First Report
            </Button>
            {hackTypeFilter !== "all" && (
              <Button
                variant="outline"
                onClick={() => setHackTypeFilter("all")}
                className="border-primary/30 hover:bg-primary/10"
              >
                View All Reports
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};