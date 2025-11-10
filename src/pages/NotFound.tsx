import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, TrendingDown } from "lucide-react";
import logoImage from "@/assets/ns-finsight-logo.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-destructive/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-destructive rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center space-y-8 max-w-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center gap-2 mb-8">
        <div className="relative h-20 w-20 flex-shrink-0">
          <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-xl ring-4 ring-primary/20">
            <img 
              src={logoImage} 
              alt="NS FinSight" 
              className="h-full w-full object-cover scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          NS FinSight
        </h1>
      </div>

        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-bold gradient-text mb-4 animate-scale-in">404</h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <TrendingDown className="w-24 h-24 text-destructive/20 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 animate-fade-in">
          <h2 className="text-4xl font-bold">Page Not Found</h2>
          <p className="text-xl text-muted-foreground">Let's get you back on track!</p>
        </div>

        <Button onClick={() => navigate("/dashboard")} size="lg" className="gap-2 hover-scale shadow-lg">
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;