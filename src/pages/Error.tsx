
import { Button } from "@/components/ui/button";
import { useNavigate, useRouteError } from "react-router-dom";
import { Home, AlertTriangle, RefreshCw } from "lucide-react";
import logoImage from "../assets/ns-finsight-logo.png";
import { AdSense } from "@/components/AdSense";

const Error = () => {
  const navigate = useNavigate();
  const error = useRouteError() as any;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-destructive/5 to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-destructive rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
          <AlertTriangle className="w-32 h-32 text-destructive mx-auto mb-6 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold">Oops! Something went wrong</h2>
          <p className="text-xl text-muted-foreground">
            {error?.statusText || error?.message || "An unexpected error occurred"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")} size="lg" className="gap-2 hover-scale shadow-lg">
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="lg" className="gap-2 hover-scale">
            <RefreshCw className="w-5 h-5" />
            Refresh Page
          </Button>
        </div>

        {error?.stack && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Technical Details
            </summary>
            <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-60">
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      <div className="mt-12 w-full max-w-4xl">
        <AdSense slot="ERROR_PAGE_SLOT_1" format="horizontal" />
      </div>
    </div>
  );
};

export default Error;
