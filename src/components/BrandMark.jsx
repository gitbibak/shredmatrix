// The Full Balance symbol (three woven loops). Decorative next to the
// "FULL BALANCE" wordmark, so it carries no alt text of its own.
export default function BrandMark({ size = 20, className = '' }) {
  return <img src="/brand/mark.svg" alt="" aria-hidden="true" width={size} height={Math.round(size * 1.031)} className={`shrink-0 ${className}`} />;
}
