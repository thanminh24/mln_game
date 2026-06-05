// Inline SVG keeps the summary page dependency-free and projector-friendly.
export function DialecticDiagram() {
  return (
    <svg
      viewBox="0 0 720 240"
      className="mx-auto w-full max-w-4xl"
      role="img"
      aria-label="Sơ đồ quan hệ biện chứng giữa tồn tại xã hội và ý thức xã hội"
    >
      <defs>
        <marker id="arrow-right" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#FFD700" />
        </marker>
        <marker id="arrow-left" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
          <polygon points="10 0, 0 3.5, 10 7" fill="#FFD700" />
        </marker>
      </defs>

      <rect x="24" y="72" width="210" height="96" rx="10" fill="#000000" stroke="#B8960C" strokeWidth="2" />
      <text x="129" y="110" textAnchor="middle" fill="#FFD700" fontFamily="Be Vietnam Pro, sans-serif" fontSize="18" fontWeight="900">
        TỒN TẠI
      </text>
      <text x="129" y="137" textAnchor="middle" fill="#FFFFFF" fontFamily="Be Vietnam Pro, sans-serif" fontSize="18" fontWeight="900">
        XÃ HỘI
      </text>

      <rect x="486" y="72" width="210" height="96" rx="10" fill="#000000" stroke="#B8960C" strokeWidth="2" />
      <text x="591" y="110" textAnchor="middle" fill="#FFD700" fontFamily="Be Vietnam Pro, sans-serif" fontSize="18" fontWeight="900">
        Ý THỨC
      </text>
      <text x="591" y="137" textAnchor="middle" fill="#FFFFFF" fontFamily="Be Vietnam Pro, sans-serif" fontSize="18" fontWeight="900">
        XÃ HỘI
      </text>

      <line x1="246" y1="100" x2="474" y2="100" stroke="#FFD700" strokeWidth="3" markerEnd="url(#arrow-right)" />
      <text x="360" y="82" textAnchor="middle" fill="#FFFFFF" fontFamily="Be Vietnam Pro, sans-serif" fontSize="16" fontWeight="700">
        quyết định
      </text>

      <line x1="474" y1="142" x2="246" y2="142" stroke="#FFD700" strokeWidth="3" markerEnd="url(#arrow-left)" />
      <text x="360" y="174" textAnchor="middle" fill="#A3A3A3" fontFamily="Be Vietnam Pro, sans-serif" fontSize="16" fontWeight="700">
        tác động trở lại
      </text>
    </svg>
  );
}
