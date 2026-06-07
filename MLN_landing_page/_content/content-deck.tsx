import type { ReactNode } from "react";
import { BIEN_CHUNG, INTRO, MISSING_CONTENT, TTXH, VAN_DUNG, YTXH } from "./content";
import { IMAGES } from "./images";

type Variant = "apple" | "editorial" | "poster" | "story" | "bento";

const navItems = [
  ["intro", "Mở đầu"],
  ["ttxh", "TTXH"],
  ["ytxh", "YTXH"],
  ["bien-chung", "Biện chứng"],
  ["van-dung", "Vận dụng"],
  ["ket-luan", "Kết luận"],
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`card ${className}`}>{children}</article>;
}

function Quote({ quote }: { quote: { text: string; author: string; source?: string } }) {
  return (
    <blockquote className="quote">
      <p>{quote.text}</p>
      <footer>{quote.author}{quote.source ? ` · ${quote.source}` : ""}</footer>
    </blockquote>
  );
}

function Points({ points }: { points: string[] }) {
  return <ul className="points">{points.map((point) => <li key={point}>{point}</li>)}</ul>;
}

function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="section">
      <div className="section-label">{label}</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ContentDeck({ variant }: { variant: Variant }) {
  return (
    <main className={`deck deck-${variant}`}>
      {variant === "apple" && <div className="cinema-vignette" aria-hidden />}
      {variant === "editorial" && <div className="editorial-masthead">MLN special feature · Tồn tại xã hội và Ý thức xã hội</div>}
      {variant === "poster" && <div className="poster-strip">07 hình thái · 05 quy luật · 02 vận dụng</div>}
      {variant === "story" && <div className="story-progress" aria-hidden />}
      {variant === "bento" && (
        <aside className="bento-index" aria-label="Thông số nội dung">
          <span>7 forms</span><span>5 laws</span><span>2 cases</span>
        </aside>
      )}
      <nav className="top-nav" aria-label="Điều hướng nội dung">
        {navItems.map(([href, label]) => <a key={href} href={`#${href}`}>{label}</a>)}
      </nav>

      <header id="intro" className="hero">
        <img src={IMAGES.landing} alt="Tồn tại xã hội và Ý thức xã hội" />
        <div className="hero-copy">
          <p className="section-label">{INTRO.answer.label}</p>
          <h1>{INTRO.title}</h1>
          <div className="question-grid">
            {INTRO.questions.map((question) => (
              <Card key={question.highlight}>
                <p>{question.text} <strong>{question.highlight}</strong>?</p>
              </Card>
            ))}
          </div>
          <Card className="answer-card">
            <p>{INTRO.answer.body}</p>
            <Points points={INTRO.answer.points} />
          </Card>
          <a className="cta" href="#ttxh">{INTRO.ctaLabel}</a>
        </div>
      </header>

      <Section id="ttxh" label="Chương 01" title={TTXH.definition.title}>
        <div className="feature-grid">
          <Card className="wide">
            <h3>Khái niệm</h3>
            <p>{TTXH.definition.body}</p>
            <p>{TTXH.definition.note}</p>
            <p>{TTXH.example}</p>
          </Card>
          <img className="media" src={IMAGES.ttxhExample} alt="Đời sống vật chất của sinh viên" />
          {TTXH.elements.map((element, index) => (
            <Card key={element.title}>
              <span className="number">0{index + 1}</span>
              <h3>{element.title}</h3>
              <p>{element.desc}</p>
              <p className="muted">{element.example}</p>
            </Card>
          ))}
          <Quote quote={TTXH.marxQuote} />
          {TTXH.timeline.map((step) => (
            <Card key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="ytxh" label="Chương 02" title="Ý thức xã hội">
        <div className="feature-grid">
          <Card className="wide">
            <h3>Khái niệm</h3>
            <p>{YTXH.definition.body}</p>
            <Points points={YTXH.definition.points} />
            <p>{YTXH.example}</p>
          </Card>
          <img className="media" src={IMAGES.ytxhExample} alt="Xe điện - ý thức xã hội" />
          <Card>
            <h3>Tâm lý xã hội</h3>
            <p>{YTXH.structure.tamLyXaHoi}</p>
          </Card>
          <Card>
            <h3>Hệ tư tưởng</h3>
            <p>{YTXH.structure.heTuTuong}</p>
          </Card>
          <Card>
            <h3>Ý thức thông thường</h3>
            <p>{YTXH.structure.thuongThuong}</p>
          </Card>
          <Card>
            <h3>Ý thức lý luận</h3>
            <p>{YTXH.structure.lyLuan}</p>
          </Card>
          <Card className="wide">
            <h3>Tác động qua lại</h3>
            <p>{YTXH.structure.interaction}</p>
          </Card>
          <Card className="wide">
            <h3>Tính giai cấp</h3>
            <p>{YTXH.classNature.body}</p>
            <p>{YTXH.classNature.example.boss}</p>
            <p>{YTXH.classNature.example.employee}</p>
          </Card>
          <img className="media" src={IMAGES.classExample} alt="Ví dụ về tính giai cấp" />
          {YTXH.forms.map((form, index) => (
            <Card key={form.name} className="form-card">
              <span className="number">0{index + 1}</span>
              <h3>{form.name}</h3>
              <p>{form.theory}</p>
              <p className="muted">{form.example}</p>
              <img src={IMAGES.forms[index]} alt={`Minh họa ${form.name}`} />
            </Card>
          ))}
        </div>
      </Section>

      <Section id="bien-chung" label="Chương 03" title={BIEN_CHUNG.headline}>
        <div className="feature-grid">
          <Quote quote={BIEN_CHUNG.marxQuote} />
          <img className="media" src={IMAGES.bienChung} alt="Minh họa quan hệ biện chứng" />
          {BIEN_CHUNG.coreAspects.map((aspect, index) => (
            <Card key={aspect.title} className="wide">
              <span className="number">0{index + 1}</span>
              <h3>{aspect.title}</h3>
              <Points points={aspect.points} />
            </Card>
          ))}
          {BIEN_CHUNG.laws.map((law, index) => (
            <Card key={law.tag} className="law-card">
              <span className="number">{law.tag}</span>
              <h3>{law.title}</h3>
              <p>{law.theory}</p>
              <p className="case-title">{law.caseTitle}</p>
              <p className="muted">{law.caseDesc}</p>
              <img src={IMAGES.laws[index]} alt={law.title} />
            </Card>
          ))}
          <Quote quote={BIEN_CHUNG.engelsQuote} />
        </div>
      </Section>

      <Section id="van-dung" label="Chương 04" title="Vận dụng">
        <Quote quote={MISSING_CONTENT.hcmQuote} />
        <div className="case-grid">
          {VAN_DUNG.caseStudies.map((study, studyIndex) => (
            <Card key={study.title} className="case-study">
              <img src={studyIndex === 0 ? IMAGES.caseFlood : IMAGES.caseDoiMoi} alt={study.title} />
              <h3>{study.title}</h3>
              {study.steps.map((step) => (
                <div className="step" key={`${study.id}-${step.label}`}>
                  <span>{step.label}</span>
                  <h4>{step.title}</h4>
                  <Points points={step.points} />
                </div>
              ))}
              {studyIndex === 1 && <Points points={MISSING_CONTENT.doiMoiStats} />}
            </Card>
          ))}
        </div>
        <Card>
          <h3>Tư liệu bổ sung</h3>
          <p>{MISSING_CONTENT.mlnRole}</p>
          <p>{MISSING_CONTENT.inheritanceVietnam}</p>
          <Points points={MISSING_CONTENT.historicalBattles} />
        </Card>
      </Section>

      <Section id="ket-luan" label="Chương 05" title="Bài học và hành động">
        <div className="feature-grid">
          {VAN_DUNG.lessons.map((lesson) => (
            <Card key={lesson.title} className="wide">
              <h3>{lesson.title}</h3>
              <Points points={lesson.points} />
            </Card>
          ))}
          {VAN_DUNG.practicalActions.map((action) => (
            <Card key={action.title}>
              <h3>{action.title}</h3>
              <p>{action.body}</p>
            </Card>
          ))}
          <Quote quote={BIEN_CHUNG.engelsQuote} />
          <Card className="summary">
            <h3>Tổng kết</h3>
            <p>{VAN_DUNG.summary.body}</p>
            <p>{VAN_DUNG.summary.closing}</p>
          </Card>
        </div>
      </Section>
    </main>
  );
}
