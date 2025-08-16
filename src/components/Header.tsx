import { useState } from "react";
import { Shield, Search, FileText, Settings, Menu, X, Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: "/", label: "Home", icon: Home, description: "Return to homepage" },
    { id: "/reports", label: "Reports", icon: FileText, description: "Browse all reports" },
    { id: "/submit", label: "Submit Report", icon: Shield, description: "Report a hacker" },
    { id: "/search", label: "Search", icon: Search, description: "Find specific reports" },
    { id: "/analytics", label: "Analytics", icon: BarChart3, description: "View detailed analytics" },
    { id: "/admin", label: "Admin", icon: Settings, description: "Administrative tools" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
                FF Hacker Reports
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Free Fire Anti-Cheat Community</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.id;
              
              return (
                <Link key={tab.id} to={tab.id}>
                  <Button
                    variant={isActive ? "gaming" : "ghost"}
                    size="sm"
                    onClick={handleTabChange}
                    className={`flex items-center space-x-2 relative group ${
                      isActive ? '' : 'hover:bg-primary/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {tab.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
                    </div>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.id;
                
                return (
                  <Link key={tab.id} to={tab.id}>
                    <Button
                      variant={isActive ? "gaming" : "outline"}
                      size="sm"
                      onClick={handleTabChange}
                      className={`flex flex-col items-center space-y-2 p-4 h-auto w-full`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};