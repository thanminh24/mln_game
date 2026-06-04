import { useEffect, useState } from "react";
import { Team, GameState } from "../types/shared";
import { G2_DATA } from "../data/game-data";
import { DialecticDiagram } from "../components/dialectic-diagram";
import { PodiumScoreboard } from "../components/podium-scoreboard";

type Scores = Record<Team, number> | null;

export function SummaryPage() {
  const [scores, setScores] = useState<Scores>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((state: GameState) => setScores(state.scores))
      .catch(() => setScores(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f0f] text-muted font-vietnamese">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] text-white font-vietnamese">

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 py-16"
        style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f0f 70%)" }}>
        <p className="text-muted text-sm uppercase tracking-widest mb-4">MLN111 — Triết học Mác - Lênin</p>
        <h1 className="text-game-xl font-black text-white mb-4 leading-tight">
          MỐI QUAN HỆ BIỆN CHỨNG
        </h1>
        <h2 className="text-game-lg font-bold text-gold mb-6">
          Tồn tại Xã hội ↔ Ý thức Xã hội
        </h2>
        <p className="text-muted text-game-sm">Lòng yêu nước Việt Nam</p>
      </section>

      {/* Dialectic diagram */}
      <section className="bg-[#111827] py-16 px-8">
        <h3 className="text-center text-gold font-bold text-game-md mb-8">
          Sơ đồ quan hệ biện chứng
        </h3>
        <DialecticDiagram />
      </section>

      {/* Round sections */}
      {G2_DATA.map((round, i) => (
        <section
          key={i}
          className={`py-16 px-8 ${i % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#111827]"}`}
        >
          <h3 className="text-gold font-black text-game-md mb-6">{round.round_name}</h3>

          {/* Full-width image with gradient overlay */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-8">
            <img
              src={`/images/${round.image_file}`}
              alt={round.round_name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          {/* Philosophy explanation */}
          <blockquote className="border-l-4 border-gold pl-6 py-2 text-white text-game-sm leading-relaxed max-w-3xl">
            {round.round_explanation}
          </blockquote>
        </section>
      ))}

      {/* Final scoreboard */}
      <section className="bg-[#111827] py-16 px-8">
        <h3 className="text-center text-gold font-black text-game-md mb-10">
          🏆 Kết quả cuối cùng
        </h3>
        {scores ? (
          <div className="max-w-xl mx-auto">
            <PodiumScoreboard scores={scores} />
          </div>
        ) : (
          <p className="text-center text-muted">
            Điểm số chưa có — máy chủ chưa khởi động.
          </p>
        )}
      </section>

      {/* Conclusion */}
      <section className="py-16 px-8 bg-[#0f0f0f]">
        <div className="max-w-2xl mx-auto border border-gold/30 rounded-2xl p-8 text-center space-y-4">
          <blockquote className="text-game-sm text-white leading-relaxed italic">
            "Lòng yêu nước không chỉ là lý thuyết — nó là sức mạnh vật chất
            đã và đang cải tạo Tồn tại xã hội của dân tộc Việt Nam."
          </blockquote>
          <p className="text-muted text-sm">
            MLN111 · Triết học Mác - Lênin · {new Date().getFullYear()}
          </p>
        </div>
      </section>

    </div>
  );
}
