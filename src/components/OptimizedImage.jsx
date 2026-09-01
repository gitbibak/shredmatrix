// Serves the WebP variants produced by scripts/optimize-images.mjs with the
// original JPG/PNG as fallback. Use for any image under /images or /og.
const WEBP_READY = /^\/(images|og)\/.+\.(jpe?g|png)$/i;

export function webpSources(src) {
  if (!WEBP_READY.test(src || '')) return null;
  const base = src.replace(/\.(jpe?g|png)$/i, '');
  return { small: `${base}-960.webp`, full: `${base}.webp` };
}

export default function OptimizedImage({ src, alt = '', sizes = '100vw', className = '', ...imgProps }) {
  const sources = webpSources(src);
  if (!sources) return <img src={src} alt={alt} className={className} {...imgProps} />;
  return (
    <picture>
      <source type="image/webp" srcSet={`${sources.small} 960w, ${sources.full} 1600w`} sizes={sizes} />
      <img src={src} alt={alt} className={className} {...imgProps} />
    </picture>
  );
}
