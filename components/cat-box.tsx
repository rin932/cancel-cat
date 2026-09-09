type CatBoxProps = {
  open?: boolean;
  className?: string;
};

export function CatBox({ open = false, className = "" }: CatBoxProps) {
  return (
    <div className={`box-stage ${className}`}>
      <div className={`crate ${open ? "is-open" : ""}`} aria-hidden="true">
        <div className="crate-ears">
          <span />
          <span />
        </div>
        <div className="crate-lid" />
        <div className="crate-lock" />
        <div className="crate-body" />
        <div className="crate-glow" />
        <svg className="crate-cat" viewBox="0 0 92 92" fill="none">
          <ellipse cx="46" cy="78" rx="24" ry="8" fill="rgba(0,0,0,0.25)" />
          <path
            d="M22 54c0-16 10-28 24-28s24 12 24 28c0 14-8 24-24 24S22 68 22 54Z"
            fill="#1d1c22"
          />
          <path d="M28 28l8 16-14 2 6-18Z" fill="#1d1c22" />
          <path d="M64 28l-8 16 14 2-6-18Z" fill="#1d1c22" />
          <path d="M28 28l6 12-10 1 4-13Z" fill="#e8b4c8" />
          <path d="M64 28l-6 12 10 1-4-13Z" fill="#e8b4c8" />
          <circle cx="38" cy="52" r="3.2" fill="#f4ead7" />
          <circle cx="54" cy="52" r="3.2" fill="#f4ead7" />
          <circle cx="38.8" cy="51.4" r="1.1" fill="#07060b" />
          <circle cx="54.8" cy="51.4" r="1.1" fill="#07060b" />
          <path d="M46 58c2 0 4 2 0 4-4-2-2-4 0-4Z" fill="#e07a8a" />
          <path
            d="M34 62c4 6 20 6 24 0"
            stroke="#f4ead7"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M70 58c10-8 16 4 8 10" stroke="#1d1c22" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
