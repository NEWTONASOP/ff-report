import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ReportsList } from "@/components/ReportsList";
import { Card } from "@/components/ui/card";
import { FileText, Search, Shield, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Link to="/submit">
              <Card className="gaming-card p-4 sm:p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 mb-3">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Submit Report</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Report suspicious players with proof
                </p>
              </Card>
            </Link>
            
            <Link to="/search">
              <Card className="gaming-card p-4 sm:p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500/20 mb-3">
                  <Search className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Search Reports</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Find and analyze player reports
                </p>
              </Card>
            </Link>
            
            <Link to="/reports">
              <Card className="gaming-card p-4 sm:p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer sm:col-span-2 lg:col-span-1">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500/20 mb-3">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Browse All</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  View all community reports
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Community Impact Section */}
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
            Community Impact
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="gaming-card text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 mb-2 sm:mb-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">1</h3>
              <p className="text-xs font-medium mb-1">Total Reports</p>
              <p className="text-xs text-muted-foreground">Community submissions</p>
            </Card>
            <Card className="gaming-card text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 mb-2 sm:mb-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">1</h3>
              <p className="text-xs font-medium mb-1">Total Votes</p>
              <p className="text-xs text-muted-foreground">Community participation</p>
            </Card>
            <Card className="gaming-card text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 mb-2 sm:mb-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">0</h3>
              <p className="text-xs font-medium mb-1">Suspicious Reports</p>
              <p className="text-xs text-muted-foreground">Flagged by community</p>
            </Card>
            <Card className="gaming-card text-center p-3 sm:p-4 hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500 mb-2 sm:mb-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">1</h3>
              <p className="text-xs font-medium mb-1">Recent Reports</p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
