import { Loader2 } from "lucide-react";
import logoImage from "@/assets/ns-finsight-logo.png";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative h-32 w-32 flex-shrink-0">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-2xl relative z-10 ring-4 ring-primary/20 animate-scale-in">
            <img
              src={logoImage}
              alt="NS FinSight"
              className="h-full w-full object-cover scale-110"
              onError={(e) => {
                console.error('Logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Fetching your data...</p>
          <p className="text-xs text-muted-foreground/70">Almost there, just getting your numbers ready 📊</p>
        </div>
      </div>
    </div>
  );
};