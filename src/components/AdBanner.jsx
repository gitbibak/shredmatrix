import { useEffect, useRef } from 'react';

const AD_SLOTS = {
  banner: { height: 100, slot: '' },
  native: { height: 250, slot: '' },
};

export default function AdBanner({ type = 'banner', className = '' }) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  const config = AD_SLOTS[type] || AD_SLOTS.banner;

  // Don't render if AdSense not configured yet
  if (!config.slot) return null;

  return (
    <div className={`flex justify-center my-3 ${className}`}>
      <div
        ref={adRef}
        className="bg-slate-900/30 border border-slate-800/20 rounded-xl overflow-hidden w-full"
        style={{ minHeight: config.height }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client=""
          data-ad-slot={config.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
