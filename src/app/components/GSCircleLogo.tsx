export default function GSCircleLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="60" cy="60" r="58" fill="#1a2760"/>
      {/* Gold ring border */}
      <circle cx="60" cy="60" r="55" stroke="#bca056" strokeWidth="1.5" fill="none"/>
      <circle cx="60" cy="60" r="52" stroke="#bca056" strokeWidth="0.5" fill="none"/>

      {/* House roof shape */}
      <polyline points="42,52 60,36 78,52" stroke="#bca056" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>

      {/* G letter */}
      <path d="M36 58 C36 50 42 45 50 45 C54 45 58 47 60 50 L60 57 L54 57 L54 55 C53 53 51.5 52 50 52 C46.5 52 44 55 44 59 C44 63 46.5 66 50 66 C52.5 66 54.5 64.5 55.5 62.5 L55.5 61 L49 61 L49 55.5 L62 55.5 L62 68 L58 68 L57 66 C55 68 52.5 69 50 69 C42 69 36 64 36 58 Z" fill="#bca056"/>

      {/* S letter */}
      <path d="M65 66.5 C65 66.5 68 69 73 69 C77.5 69 81 67 81 63.5 C81 60.5 79 58.5 75 57.5 L72 56.5 C70 56 69 55 69 53.5 C69 52 70.5 51 72.5 51 C75 51 77 52.5 77 52.5 L79.5 48.5 C79.5 48.5 77 46.5 72.5 46.5 C68 46.5 64.5 49 64.5 53 C64.5 56.5 66.5 58.5 70 59.5 L73 60.5 C75.5 61.2 76.5 62.2 76.5 63.8 C76.5 65.5 75 66.5 73 66.5 C70 66.5 67.5 64.5 67.5 64.5 L65 66.5 Z" fill="#bca056"/>

      {/* GREAT SOCIETY text */}
      <text x="60" y="82" textAnchor="middle" fill="#bca056" fontSize="7.5" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1.5">GREAT SOCIETY</text>

      {/* REALESTATE text */}
      <text x="60" y="92" textAnchor="middle" fill="#bca056" fontSize="5" fontFamily="Arial, sans-serif" letterSpacing="0.8" opacity="0.9">REALESTATE &amp; CONSTRUCTION</text>
    </svg>
  );
}
