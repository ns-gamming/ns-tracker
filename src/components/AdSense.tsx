import { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export const AdSense = ({ 
  slot, 
  format = 'auto', 
  style = {}, 
  className = '',
  responsive = true 
}: AdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    const loadAd = async () => {
      try {
        if (adRef.current && window) {
          await new Promise(resolve => setTimeout(resolve, 100));
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.error('AdSense error:', error);
        setAdError(true);
      }
    };

    loadAd();
  }, []);

  return (
    <div 
      ref={adRef}
      className={`adsense-container my-6 ${className} ${!adLoaded && !adError ? 'animate-pulse bg-muted/30 rounded-lg' : ''}`}
      style={{ 
        minHeight: format === 'vertical' ? '600px' : format === 'horizontal' ? '90px' : '250px',
        display: 'block',
        textAlign: 'center',
        overflow: 'hidden',
        ...style 
      }}
    >
      {!adError ? (
        <ins
          className="adsbygoogle"
          style={{ 
            display: 'block',
            ...style 
          }}
          data-ad-client="ca-pub-4779140243670658"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Advertisement
        </div>
      )}
    </div>
  );
};
