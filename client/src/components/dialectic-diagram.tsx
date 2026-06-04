// Inline SVG — no external library. TTXH ↔ YTXH dialectic relationship.
export function DialecticDiagram() {
  return (
    <svg
      viewBox="0 0 600 180"
      className="w-full max-w-2xl mx-auto"
      aria-label="Sơ đồ quan hệ biện chứng TTXH và YTXH"
    >
      {/* TTXH box */}
      <rect x="20" y="60" width="160" height="60" rx="12" fill="#1e40af" />
      <text x="100" y="86" textAnchor="middle" fill="white" fontFamily="Be Vietnam Pro, sans-serif" fontSize="14" fontWeight="700">
        TỒN TẠI
      </text>
      <text x="100" y="106" textAnchor="middle" fill="white" fontFamily="Be Vietnam Pro, sans-serif" fontSize="14" fontWeight="700">
        XÃ HỘI
      </text>

      {/* YTXH box */}
      <rect x="420" y="60" width="160" height="60" rx="12" fill="#b45309" />
      <text x="500" y="86" textAnchor="middle" fill="white" fontFamily="Be Vietnam Pro, sans-serif" fontSize="14" fontWeight="700">
        Ý THỨC
      </text>
      <text x="500" y="106" textAnchor="middle" fill="white" fontFamily="Be Vietnam Pro, sans-serif" fontSize="14" fontWeight="700">
        XÃ HỘI
      </text>

      {/* Top arrow: TTXH → quyết định → YTXH */}
      <defs>
        <marker id="arrow-right" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        <marker id="arrow-left" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
          <polygon points="10 0, 0 3.5, 10 7" fill="#6b7280" />
        </marker>
      </defs>
      <line x1="185" y1="75" x2="415" y2="75" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrow-right)" />
      <text x="300" y="68" textAnchor="middle" fill="#9ca3af" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11">
        quyết định
      </text>

      {/* Bottom arrow: YTXH → tác động trở lại → TTXH */}
      <line x1="415" y1="105" x2="185" y2="105" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrow-left)" />
      <text x="300" y="122" textAnchor="middle" fill="#9ca3af" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11">
        tác động trở lại
      </text>
    </svg>
  );
}
