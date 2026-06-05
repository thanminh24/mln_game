import { useEffect, useState } from "react";
import { GameState } from "../types/shared";
import { CASE_STUDY_SUMMARY, KEYWORD, KEYWORD_ASCII } from "../data/game-data";
import { DialecticDiagram } from "../components/dialectic-diagram";

export function SummaryPage() {
  const [state, setState] = useState<GameState | null>(null);

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
        <div className="mt-8 rounded-xl border border-yellow/40 bg-yellow/5 px-8 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Điểm</p>
          <p className="text-5xl font-black leading-none text-yellow">{state?.score ?? 0}</p>
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
    </div>
  );
}
