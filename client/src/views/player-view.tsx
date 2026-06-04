// Phase 1 stub — player view is minimal for v1 (host-only projector mode)
export function PlayerView() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0f0f0f] text-white font-vietnamese">
      <div className="text-center space-y-2">
        <h1 className="text-game-lg font-bold">MLN111</h1>
        <p className="text-muted text-game-sm">Chờ giáo viên bắt đầu...</p>
      </div>
    </div>
  );
}
