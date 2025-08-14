import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-2 sm:pt-3 lg:pt-2 pb-2 sm:pb-3 lg:pb-2 px-1 sm:px-2 lg:px-1">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-4 sm:mt-6 lg:mt-4">
        <div className="container mx-auto px-4 py-3 sm:py-4 lg:py-3">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            <p>
              FF Hacker Reports - Free Fire Anti-Cheat Community • Keeping Gaming Fair
            </p>
            <p className="mt-1">
              Report responsibly • False reports may result in penalties
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 