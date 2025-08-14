import { useState, useEffect } from "react";
import { Lock, Trash2, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    flagged: 0,
  });
  const { toast } = useToast();

  // Simple admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = "ffhacker2024";

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadReports();
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      loadReports();
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin panel.",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid admin password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword("");
    setReports([]);
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportData = data || [];
      setReports(reportData);

      // Calculate stats
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setStats({
        total: reportData.length,
        recent: reportData.filter(r => new Date(r.created_at) > last24h).length,
        flagged: reportData.filter(r => r.downvotes > r.upvotes + 5).length,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report deleted",
        description: "The report has been removed.",
      });

      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="gaming-card max-w-md mx-auto">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse-glow" />
          <h2 className="text-2xl font-bold">Admin Access Required</h2>
          <p className="text-muted-foreground">Enter admin password to continue</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-foreground">Admin Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="gaming-input pr-10"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            variant="gaming"
            onClick={handleLogin}
            disabled={!password}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Access Admin Panel
          </Button>
        </div>

        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Admin access is protected. Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gaming-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-primary">Total Reports</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-500">Last 24h</h3>
            <p className="text-2xl font-bold">{stats.recent}</p>
          </div>
          <div className="bg-destructive/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-destructive">Flagged</h3>
            <p className="text-2xl font-bold">{stats.flagged}</p>
          </div>
        </div>

        <Button
          variant="gaming"
          onClick={loadReports}
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? "Loading..." : "Refresh Reports"}
        </Button>
      </Card>

      {reports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">All Reports</h3>
          
          <div className="grid gap-4">
            {reports.map((report) => (
              <div key={report.id} className="relative">
                <ReportCard
                  report={report}
                  onUpdate={loadReports}
                />
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-2">
                    {report.downvotes > report.upvotes + 5 && (
                      <Badge variant="destructive" className="text-xs">
                        FLAGGED
                      </Badge>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading reports...</p>
        </div>
      )}
    </div>
  );
};