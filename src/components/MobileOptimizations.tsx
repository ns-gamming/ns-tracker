
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileOptimizations = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Disable hover effects on mobile
      document.body.classList.add('mobile-device');
      
      // Add touch-friendly spacing
      document.documentElement.style.setProperty('--touch-target-size', '44px');
      
      // Optimize scroll performance
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    }

    return () => {
      document.body.classList.remove('mobile-device');
    };
  }, [isMobile]);

  useEffect(() => {
    // Prevent zoom on double-tap for iOS
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  return null;
};
