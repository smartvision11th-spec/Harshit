type Props = { className?: string; showText?: boolean };

export default function Logo({ className = '', showText = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="14" fill="#111318" stroke="rgba(245,245,245,0.14)" />
        <path d="M14 16h10l8 24 8-24h10L36 50h-8z" fill="#F5F5F5" />
        <path d="M40 16h10L38 42z" fill="#FF5A1F" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="display text-[1.45rem] tracking-[0.04em]">Velocity</span>
          <span className="mt-[3px] text-[0.62rem] font-medium uppercase tracking-[0.34em] text-smoke">Auto Detailing</span>
        </span>
      )}
    </span>
  );
}
