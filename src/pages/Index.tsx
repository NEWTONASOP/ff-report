import { HeroSection } from "@/components/HeroSection";
import { StatsOverview } from "@/components/StatsOverview";
import { ReportsList } from "@/components/ReportsList";
import { Card } from "@/components/ui/card";
import { FileText, Search, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {

  return (
    <>
      <HeroSection />
      
      {/* All Reports Section */}
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <ReportsList hideControls={true} />
      </div>
      
      {/* Quick Actions Section */}
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/submit">
              <Card className="gaming-card p-4 sm:p-5 text-center cursor-pointer">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/20 mb-3">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Submit Report</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Report suspicious players with proof
                </p>
              </Card>
            </Link>
            
            <Link to="/search">
              <Card className="gaming-card p-4 sm:p-5 text-center cursor-pointer">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-500/20 mb-3">
                  <Search className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Search Reports</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Find and analyze player reports
                </p>
              </Card>
            </Link>
            
            <Link to="/analytics" className="group">
              <Card className="gaming-card p-6 sm:p-8 text-center cursor-pointer group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 group-hover:text-purple-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors duration-300">Analytics</h3>
                  <p className="text-sm sm:text-base text-muted-foreground group-hover:text-muted-foreground/80 leading-relaxed">
                    View detailed insights & trends
                  </p>
                </div>
              </Card>
            </Link>
            
            <Link to="/reports" className="group">
              <Card className="gaming-card p-6 sm:p-8 text-center cursor-pointer group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 group-hover:text-green-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-green-400 transition-colors duration-300">Browse All</h3>
                  <p className="text-sm sm:text-base text-muted-foreground group-hover:text-muted-foreground/80 leading-relaxed">
                    View all community reports
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Community Impact Dashboard */}
      <StatsOverview />

    </>
  );
};

export default Index;
