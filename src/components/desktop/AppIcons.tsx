/** High-resolution vector app icons for the liquid-glass dock. */
const frame = "h-full w-full drop-shadow-[0_6px_10px_rgba(15,23,42,0.28)]";

function AdobeIcon({ bg, fg, letters }: { bg: string; fg: string; letters: string }) {
  return (
    <svg viewBox="0 0 100 100" className={frame}>
      <rect x="2" y="2" width="96" height="96" rx="22" fill={bg} />
      <rect x="7" y="7" width="86" height="86" rx="17" fill="none" stroke={fg} strokeWidth="4" />
      <text x="50" y="64" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="40" fill={fg}>
        {letters}
      </text>
    </svg>
  );
}

export const AeIcon = () => <AdobeIcon bg="#00005b" fg="#9999ff" letters="Ae" />;
export const PsIcon = () => <AdobeIcon bg="#001e36" fg="#31a8ff" letters="Ps" />;
export const AiIcon = () => <AdobeIcon bg="#330000" fg="#ff9a00" letters="Ai" />;

export const ShowreelIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <defs>
      <linearGradient id="sr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff5f6d" />
        <stop offset="1" stopColor="#c81d4e" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#sr)" />
    <rect x="18" y="28" width="64" height="44" rx="9" fill="none" stroke="#fff" strokeWidth="5" />
    <path d="M44 40v20l16-10z" fill="#fff" />
    <circle cx="80" cy="20" r="13" fill="#fff" />
    <text x="80" y="26" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="18" fill="#c81d4e">
      !
    </text>
  </svg>
);

export const NotesIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <rect x="2" y="2" width="96" height="96" rx="22" fill="#fffdf5" />
    <path d="M2 24a22 22 0 0 1 22-22h52a22 22 0 0 1 22 22v8H2z" fill="#ffcc33" />
    {[46, 58, 70, 82].map((y) => (
      <line key={y} x1="14" x2="86" y1={y} y2={y} stroke="#e5e0cf" strokeWidth="2.5" />
    ))}
    <path d="M14 46h50M14 58h38" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const PhotosIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <rect x="2" y="2" width="96" height="96" rx="22" fill="#fff" />
    {["#f43f5e", "#f97316", "#facc15", "#84cc16", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"].map((c, i) => (
      <ellipse
        key={c}
        cx="50"
        cy="31"
        rx="11"
        ry="19"
        fill={c}
        opacity="0.82"
        transform={`rotate(${i * 45} 50 50)`}
        style={{ mixBlendMode: "multiply" }}
      />
    ))}
  </svg>
);

export const InstagramAppIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <defs>
      <radialGradient id="ig" cx="0.3" cy="1.05" r="1.2">
        <stop offset="0" stopColor="#feda75" />
        <stop offset="0.25" stopColor="#fa7e1e" />
        <stop offset="0.5" stopColor="#d62976" />
        <stop offset="0.75" stopColor="#962fbf" />
        <stop offset="1" stopColor="#4f5bd5" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#ig)" />
    <rect x="24" y="24" width="52" height="52" rx="15" fill="none" stroke="#fff" strokeWidth="6" />
    <circle cx="50" cy="50" r="12" fill="none" stroke="#fff" strokeWidth="6" />
    <circle cx="66" cy="34" r="3.6" fill="#fff" />
  </svg>
);

export const MailAppIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <defs>
      <linearGradient id="ml" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4fc3ff" />
        <stop offset="1" stopColor="#1570ef" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#ml)" />
    <rect x="18" y="28" width="64" height="44" rx="6" fill="#fff" />
    <path d="M20 31l30 22 30-22" fill="none" stroke="#1570ef" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);

export const TrashAppIcon = () => (
  <svg viewBox="0 0 100 100" className={frame}>
    <defs>
      <linearGradient id="tr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f8fafc" stopOpacity="0.95" />
        <stop offset="1" stopColor="#cbd5e1" stopOpacity="0.85" />
      </linearGradient>
    </defs>
    <path d="M22 26h56l-6 64a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5z" fill="url(#tr)" stroke="#94a3b8" strokeWidth="2" />
    <rect x="16" y="16" width="68" height="10" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
    {[38, 50, 62].map((x) => (
      <line key={x} x1={x} x2={x} y1="36" y2="84" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
    ))}
    <rect x="34" y="40" width="22" height="16" rx="2" fill="#a78bfa" opacity="0.65" transform="rotate(-14 45 48)" />
  </svg>
);
