import { useState, useEffect } from "react";
import { Search, Filter, User, Hash, TrendingUp, Clock, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ReportCard } from "./ReportCard";

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

export const SearchPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hackTypeFilter, setHackTypeFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalFound: 0,
    suspiciousCount: 0,
    recentCount: 0
  });

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

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Check if there's a search query from hero section
    const heroSearchQuery = localStorage.getItem('hero_search_query');
    if (heroSearchQuery) {
      setSearchQuery(heroSearchQuery);
      localStorage.removeItem('hero_search_query'); // Clear it after loading
      // Auto-trigger search for hero search queries
      setTimeout(() => handleSearch(heroSearchQuery), 100);
    }
  }, []);

  const saveToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      let supabaseQuery = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      // Search both IGN and UID simultaneously using OR condition
      supabaseQuery = supabaseQuery.or(`ign.ilike.%${searchTerm}%,uid.ilike.%${searchTerm}%`);

      // Apply hack type filter
      if (hackTypeFilter && hackTypeFilter !== "all") {
        supabaseQuery = supabaseQuery.eq('hack_type', hackTypeFilter);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      const reportsData = data || [];
      setReports(reportsData);
      
      // Calculate search stats
      const suspiciousCount = reportsData.filter(r => r.upvotes > r.downvotes).length;
      const recentCount = reportsData.filter(r => {
        const reportDate = new Date(r.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return reportDate >= yesterday;
      }).length;

      setSearchStats({
        totalFound: reportsData.length,
        suspiciousCount,
        recentCount
      });

      saveToSearchHistory(searchTerm);
    } catch (error) {
      console.error('Error searching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    // Auto-trigger search for quick searches
    setTimeout(() => handleSearch(query), 100);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setHackTypeFilter("all");
    setReports([]);
          setSearchStats({ totalFound: 0, suspiciousCount: 0, recentCount: 0 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <Card className="gaming-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-300/5" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-primary/20 rounded-full">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
                Search Reports
              </h2>
              <p className="text-muted-foreground">Find and analyze player reports by IGN or UID</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Search Controls */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-foreground flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Search Query</span>
                </Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter player IGN or UID..."
                  className="gaming-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hack-filter" className="text-foreground flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Hack Type Filter</span>
                </Label>
                <Select value={hackTypeFilter} onValueChange={setHackTypeFilter}>
                  <SelectTrigger className="gaming-input">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {hackTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="gaming"
                onClick={() => handleSearch()}
                disabled={isLoading || !searchQuery.trim()}
                className="flex items-center justify-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search Reports</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={clearSearch}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border-primary/30 hover:bg-primary/10 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Recent Searches</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-all duration-200"
                      onClick={() => handleQuickSearch(query)}
                    >
                      {query}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {reports.length > 0 && (
        <div className="space-y-6">
          {/* Results Header with Stats */}
          <Card className="gaming-card">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Search Results ({searchStats.totalFound} found)
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-red-400" />
                    <span>{searchStats.suspiciousCount} Suspicious Reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-300" />
                    <span>{searchStats.recentCount} Recent (24h)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-400/30">
                  <Zap className="h-3 w-3 mr-1" />
                  {searchStats.suspiciousCount} Suspicious
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-300/30">
                  <Clock className="h-3 w-3 mr-1" />
                  {searchStats.recentCount} Recent
                </Badge>
              </div>
            </div>
          </Card>

          {/* Reports Grid */}
          <div className="grid gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpdate={() => handleSearch()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="gaming-card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground mb-2">Searching reports...</p>
          <p className="text-muted-foreground">Please wait while we fetch the latest data</p>
        </Card>
      )}

      {/* No Results State */}
      {reports.length === 0 && searchQuery && !isLoading && (
        <Card className="gaming-card text-center py-12">
          <div className="p-4 bg-muted/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No Reports Found</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            No reports found for "{searchQuery}". This player appears to be clean or hasn't been reported yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report This Player
            </Button>
            <Button
              variant="ghost"
              onClick={clearSearch}
            >
              Try Different Search
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};