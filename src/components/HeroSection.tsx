import { useState, useEffect } from "react";
import { Shield, Users, TrendingUp, AlertTriangle, ArrowRight, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";



interface Stats {
  totalReports: number;
  totalVotes: number;
  suspiciousReports: number;
  recentReports24h: number;
}

export const HeroSection = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    totalVotes: 0,
    suspiciousReports: 0,
    recentReports24h: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Store search query in localStorage for the search panel
    localStorage.setItem('hero_search_query', searchQuery);

    // Add a small delay for better UX
    setTimeout(() => {
      navigate("/search");
      setIsSearching(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const StatCard = ({ icon: Icon, label, value, description, color }: {
    icon: any;
    label: string;
    value: string | number;
    description: string;
    color: string;
  }) => (
    <Card className="gaming-card text-center p-4 hover:scale-105 transition-transform duration-300">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-1">{value}</h3>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );

  return (
    <section className="relative overflow-hidden py-8 sm:py-12">
      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-300/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Compact Hero Content */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse-glow" />
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
              Community Driven
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-blue-400 to-blue-300 bg-clip-text text-transparent px-2 leading-tight">
            Keep Free Fire Fair
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 font-medium">
            Join the fight for fair play. Report hackers, verify reports, and help build a stronger Free Fire community.
          </p>

          <div className="flex flex-col gap-3 justify-center items-center px-4">
            <Button
              size="lg"
              className="gaming-button text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              onClick={() => navigate("/submit")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Report a Hacker
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {/* Direct Search Bar */}
            <div className="relative w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by player name or UID"
                  className="gaming-input pl-10 pr-20 py-2 sm:py-3 text-sm sm:text-base border-primary/30 focus:border-primary w-full"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 sm:h-8 px-2 sm:px-3 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                >
                  {isSearching ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 