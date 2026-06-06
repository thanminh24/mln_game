import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GameState } from "../types/shared";
import { CASE_STUDY_SUMMARY, KEYWORD, KEYWORD_ASCII } from "../data/game-data";
import { DialecticDiagram } from "../components/dialectic-diagram";

export function SummaryPage() {
  const [state, setState] = useState<GameState | null>(null);
  const teams = [...(state?.teams ?? [])].sort((a, b) => b.score - a.score);
  const winner = teams[0];

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((nextState: GameState) => setState(nextState))
      .catch(() => setState(null));
  }, []);

  return (
    <div className="min-h-dvh bg-black text-white font-vietnamese">
      <section className="flex min-h-[88dvh] flex-col items-center justify-center px-5 py-14 text-center">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-yellow">
          MLN111 · Triết học Mác - Lênin
        </p>
        <h1 className="max-w-5xl break-words text-[clamp(3rem,9vw,6.5rem)] font-black leading-none text-yellow">
          {KEYWORD}
        </h1>
        <p className="mt-4 text-sm font-black uppercase tracking-[0.28em] text-muted">
          {KEYWORD_ASCII}
        </p>
        <div className="mt-8 grid w-full max-w-5xl gap-3 md:grid-cols-5">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className={[
                "rounded-xl border bg-surface px-5 py-4 text-left",
                idx === 0 ? "border-yellow" : "border-border",
              ].join(" ")}
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                {team.name}
              </p>
              <p className="mt-3 text-4xl font-black leading-none text-yellow">{team.score}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-yellow/40 bg-yellow/5 px-8 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Đội dẫn đầu</p>
          <p className="text-4xl font-black leading-none text-yellow">{winner?.name ?? "Chưa có"}</p>
          <p className="mt-2 text-sm font-bold text-muted">
            Mốc điểm hàng ngang: {state?.maxScore ?? 0}
          </p>
        </div>
        <h2 className="mt-8 max-w-3xl text-game-sm font-black leading-tight text-white">
          Lòng yêu nước trong mối quan hệ biện chứng giữa tồn tại xã hội và ý thức xã hội
        </h2>
        <p className="mt-5 max-w-4xl text-xl font-semibold leading-relaxed text-muted">
          {CASE_STUDY_SUMMARY}
        </p>
      </section>

      <section className="bg-surface px-5 py-16 xl:py-20">
        <h3 className="mb-10 text-center text-game-sm font-black text-yellow">
          Sơ đồ quan hệ biện chứng
        </h3>
        <DialecticDiagram />
      </section>

      <section className="flex justify-center px-5 py-16">
        <blockquote className="max-w-3xl border-l-4 border-yellow pl-6 text-xl font-bold italic leading-relaxed text-white">
          Lòng yêu nước không chỉ là khẩu hiệu tinh thần. Trong điều kiện lịch sử cụ thể,
          nó có thể trở thành động lực tổ chức hành động, củng cố niềm tin, định hướng
          cộng đồng và tác động trở lại tồn tại xã hội.
        </blockquote>
      </section>

      <section className="flex justify-center px-5 pb-16">
        <Link
          to="/"
          className="rounded-md border border-yellow-dim bg-[#1A1600] px-5 py-3 text-sm font-bold text-yellow hover:bg-yellow hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
        >
          Quay lại bảng chơi
        </Link>
      </section>
    </div>
  );
}
