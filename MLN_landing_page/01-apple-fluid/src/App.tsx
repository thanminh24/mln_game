import type { CSSProperties, ElementType, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BIEN_CHUNG, INTRO, MISSING_CONTENT, TTXH, VAN_DUNG, YTXH } from "@content/content";
import { IMAGES } from "@content/images";
import { useScrollStage } from "./use-scroll-stage";

const NAV = [
  ["intro", "Mở đầu"],
  ["ttxh", "TTXH"],
  ["ytxh", "YTXH"],
  ["bien-chung", "Biện chứng"],
  ["van-dung", "Vận dụng"],
  ["ket-luan", "Kết luận"],
] as const;

const YTXH_STRUCTURE = [
  ["Tâm lý xã hội", YTXH.structure.tamLyXaHoi],
  ["Hệ tư tưởng", YTXH.structure.heTuTuong],
  ["Ý thức thông thường", YTXH.structure.thuongThuong],
  ["Ý thức lý luận", YTXH.structure.lyLuan],
  ["Tác động qua lại", YTXH.structure.interaction],
] as const;

type CarouselProps<T> = {
  ariaLabel: string;
  className?: string;
  items: readonly T[];
  renderSlide: (item: T, index: number) => ReactNode;
};

type SequenceStageProps = {
  as?: ElementType;
  id?: string;
  className?: string;
  image: string;
  alt: string;
  overlayClassName?: string;
  copyClassName?: string;
  steps: ReactNode[];
};

function splitWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function renderWordSpans(text: string, className = "word") {
  return splitWords(text).map((word, index, words) => (
    <span
      key={`${word}-${index}`}
      className={className}
      data-word
      style={{ "--word-index": index, "--word-total": words.length } as CSSProperties}
    >
      {word}
    </span>
  ));
}

function RevealText<T extends ElementType>({
  as,
  className,
  text,
}: {
  as: T;
  className?: string;
  text: string;
}) {
  const Tag = as;
  return (
    <Tag className={className} data-word-reveal>
      {renderWordSpans(text)}
    </Tag>
  );
}

function FadeBlock<T extends ElementType>({
  as,
  className,
  once,
  fast,
  children,
}: {
  as: T;
  className?: string;
  once?: boolean;
  fast?: boolean;
  children: ReactNode;
}) {
  const Tag = as;
  return (
    <Tag
      className={className}
      data-fade={once ? undefined : true}
      data-fade-once={once ? true : undefined}
      data-fade-fast={fast ? true : undefined}
    >
      {children}
    </Tag>
  );
}

function SequenceStage({
  as,
  id,
  className,
  image,
  alt,
  overlayClassName,
  copyClassName,
  steps,
}: SequenceStageProps) {
  const Tag = as ?? "section";
  return (
    <Tag
      id={id}
      className={`sequence-stage ${className ?? ""}`}
      data-sequence
      style={{ "--sequence-steps": steps.length } as CSSProperties}
    >
      <div className="sequence-stage__sticky">
        <img className="stage-bg" src={image} alt={alt} loading="lazy" />
        <div className={`sequence-stage__overlay ${overlayClassName ?? ""}`}>
          <div className={`sequence-stage__copy ${copyClassName ?? ""}`}>
            <div className="sequence-stage__stack">
              {steps.map((step, index) => (
                <div className="sequence-step" key={index} data-sequence-item>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Tag>
  );
}

function WordCarousel<T>({ ariaLabel, className, items, renderSlide }: CarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const carouselId = useId();
  const maxIndex = Math.max(items.length - 1, 0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = Array.from(viewport.children) as HTMLElement[];
    if (slides.length === 0) return;

    const updateState = () => {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let nextIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const distance = Math.abs(slideCenter - center);

        if (distance < minDistance) {
          minDistance = distance;
          nextIndex = index;
        }
      });

      const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 1);
      setActiveIndex(nextIndex);
      setProgressValue(viewport.scrollLeft / maxScroll);
    };

    updateState();
    viewport.addEventListener("scroll", updateState, { passive: true });

    const resizeObserver = new ResizeObserver(updateState);
    resizeObserver.observe(viewport);
    slides.forEach((slide) => resizeObserver.observe(slide));

    return () => {
      viewport.removeEventListener("scroll", updateState);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = Array.from(viewport.children) as HTMLElement[];
    slides[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const handleArrow = (direction: -1 | 1) => {
    scrollToIndex(Math.min(maxIndex, Math.max(0, activeIndex + direction)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleArrow(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleArrow(-1);
    }
  };

  return (
    <section className={`carousel-stage ${className ?? ""}`}>
      <div className="carousel-shell">
        <div
          ref={viewportRef}
          className="carousel-viewport"
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => (
            <article
              key={`${carouselId}-${index}`}
              className="carousel-slide"
              id={`${carouselId}-slide-${index}`}
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${items.length}`}
            >
              {renderSlide(item, index)}
            </article>
          ))}
        </div>

        <div className="carousel-controls" aria-label={`${ariaLabel} controls`}>
          <button
            type="button"
            className="carousel-arrow"
            aria-label="Slide trước"
            onClick={() => handleArrow(-1)}
            disabled={activeIndex === 0}
          >
            <span aria-hidden="true">←</span>
          </button>

          <label className="carousel-scrub">
            <span className="sr-only">Thanh điều hướng slide</span>
            <input
              type="range"
              min={0}
              max={maxIndex}
              step={1}
              value={activeIndex}
              aria-label="Điều hướng slide"
              onChange={(event) => scrollToIndex(Number(event.currentTarget.value))}
              style={
                {
                  "--scrub-progress": maxIndex === 0 ? 0 : activeIndex / maxIndex,
                } as CSSProperties
              }
            />
          </label>

          <button
            type="button"
            className="carousel-arrow"
            aria-label="Slide kế tiếp"
            onClick={() => handleArrow(1)}
            disabled={activeIndex === maxIndex}
          >
            <span aria-hidden="true">→</span>
          </button>

          <p className="carousel-meta" aria-live="polite">
            {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
        </div>

        <div className="carousel-progress-track" aria-hidden="true">
          <span style={{ width: `${progressValue * 100}%` }} />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useScrollStage();

  const ttxhSlides = useMemo(
    () =>
      TTXH.elements.map((element, index) => ({
        ...element,
        image: IMAGES.ttxh[index],
      })),
    [],
  );

  const ytxhSlides = useMemo(
    () =>
      YTXH.forms.map((form, index) => ({
        ...form,
        image: IMAGES.forms[index],
      })),
    [],
  );

  const lawSlides = useMemo(
    () =>
      BIEN_CHUNG.laws.map((law, index) => ({
        ...law,
        image: IMAGES.laws[index],
      })),
    [],
  );

  return (
    <div className="apple">
      <nav className="glass-nav" aria-label="Điều hướng nội dung">
        <div className="glass-nav__anchors">
          {NAV.map(([href, label]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <header id="intro" className="hero stage stage--hero">
        <SequenceStage
          as="div"
          className="hero-sequence"
          image={IMAGES.landing}
          alt="Tồn tại xã hội và Ý thức xã hội"
          overlayClassName="hero hero-sequence__overlay"
          copyClassName="col hero-inner"
          steps={[
            <div className="hero-sequence__step hero-sequence__step--title">
              <h1>{INTRO.title}</h1>
            </div>,
            ...INTRO.questions.map((question) => (
              <div className="hero-sequence__step hero-sequence__step--question" key={question.highlight}>
                <p>
                  {question.text} <strong>{question.highlight}</strong>
                </p>
              </div>
            )),
            <div className="hero-sequence__step hero-sequence__step--answer">
              <p className="hero-answer__lead">{INTRO.answer.body}</p>
              <ul className="points">
                {INTRO.answer.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>,
          ]}
        />
        <a className="scroll-cue" href="#ttxh" aria-label="Cuộn xuống phần Tồn tại xã hội">
          <span />
        </a>
      </header>

      <SequenceStage
        id="ttxh"
        className="section-hero section-hero--light"
        image={IMAGES.ttxhExample}
        alt="Đời sống vật chất của sinh viên"
        overlayClassName="section-hero__overlay"
        copyClassName="col section-hero__copy"
        steps={[
          <div className="section-hero__step">
            <span className="eyebrow">Chương 01</span>
            <h2>{TTXH.definition.title}</h2>
          </div>,
          <div className="section-hero__step">
            <p className="lead">{TTXH.definition.body}</p>
          </div>,
          <div className="section-hero__step">
            <p className="body">{TTXH.definition.note}</p>
          </div>,
          <div className="section-hero__step">
            <p className="body">{TTXH.example}</p>
          </div>,
        ]}
      />

      <WordCarousel
        className="sec-black"
        ariaLabel="Ba yếu tố của tồn tại xã hội"
        items={ttxhSlides}
        renderSlide={(element, index) => (
          <div className="feature-slide">
            <img className="stage-bg" src={element.image} alt={element.title} loading="lazy" />
            <div className="feature-slide__copy">
              <FadeBlock as="span" className="eyebrow" once fast>
                {`0${index + 1}`}
              </FadeBlock>
              <FadeBlock as="h2" once fast>
                {element.title}
              </FadeBlock>
              <FadeBlock as="p" className="body" once fast>
                {element.desc}
              </FadeBlock>
              <FadeBlock as="p" className="eg" once fast>
                {element.example}
              </FadeBlock>
            </div>
          </div>
        )}
      />

      <section className="quote-stage quote-stage--marx quote-stage--portrait">
        <img className="stage-bg" src={IMAGES.quoteMarxProduction} alt="" aria-hidden="true" loading="lazy" />
        <FadeBlock as="blockquote" className="quote-stage__blockquote" once fast>
          <q>{TTXH.marxQuote.text}</q>
          <footer>{TTXH.marxQuote.author}</footer>
        </FadeBlock>
      </section>

      <section className="sec sec-black statement-list statement-list--immersive">
        <div className="col">
          <RevealText as="span" className="eyebrow" text="Tồn tại xã hội quyết định ý thức xã hội" />
          {TTXH.timeline.map((step, index) => (
            <article className="statement-row statement-row--immersive" key={step.title}>
              <div className="statement-row__num">{`0${index + 1}`}</div>
              <div className="statement-row__copy">
                <RevealText as="h3" text={step.title} />
                <FadeBlock as="p" className="body">
                  {step.desc}
                </FadeBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SequenceStage
        id="ytxh"
        className="section-hero section-hero--light section-hero--ytxh"
        image={IMAGES.ytxhExample}
        alt="Xe điện và ý thức xã hội"
        overlayClassName="section-hero__overlay"
        copyClassName="col section-hero__copy"
        steps={[
          <div className="section-hero__step">
            <span className="eyebrow">Chương 02</span>
            <h2>Ý thức xã hội</h2>
          </div>,
          <div className="section-hero__step">
            <p className="lead">{YTXH.definition.body}</p>
          </div>,
          <div className="section-hero__step">
            <ul className="points">
              {YTXH.definition.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>,
          <div className="section-hero__step">
            <p className="body">{YTXH.example}</p>
          </div>,
        ]}
      />

      <section className="sec sec-dark statement-list">
        <div className="col">
          <RevealText as="span" className="eyebrow" text="Kết cấu của ý thức xã hội" />
          {YTXH_STRUCTURE.map(([title, body], index) => (
            <article className="statement-row" key={title}>
              <div className="statement-row__num">{`0${index + 1}`}</div>
              <div className="statement-row__copy">
                <RevealText as="h3" text={title} />
                <FadeBlock as="p" className="body">
                  {body}
                </FadeBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stage split-stage">
        <img className="stage-bg" src={IMAGES.classExample} alt="" aria-hidden="true" loading="lazy" />
        <div className="col-wide split-stage__grid">
          <div className="split-stage__intro">
            <RevealText as="span" className="eyebrow" text="Tính giai cấp" />
            <RevealText as="h2" text="Ý thức xã hội mang tính giai cấp" />
            <FadeBlock as="p" className="body">
              {YTXH.classNature.body}
            </FadeBlock>
          </div>
          <div className="split-stage__sides">
            <article className="split-side split-side--left">
              <RevealText as="span" className="eyebrow" text="Giai cấp thống trị" />
              <FadeBlock as="p" className="body">
                {YTXH.classNature.example.boss}
              </FadeBlock>
            </article>
            <article className="split-side split-side--right">
              <RevealText as="span" className="eyebrow" text="Giai cấp bị trị" />
              <FadeBlock as="p" className="body">
                {YTXH.classNature.example.employee}
              </FadeBlock>
            </article>
          </div>
        </div>
      </section>

      <WordCarousel
        className="sec-dark"
        ariaLabel="Các hình thái của ý thức xã hội"
        items={ytxhSlides}
        renderSlide={(form, index) => (
          <div className="feature-slide">
            <img className="stage-bg" src={form.image} alt={form.name} loading="lazy" />
            <div className="feature-slide__copy">
              <FadeBlock as="span" className="eyebrow" once fast>
                {`0${index + 1}`}
              </FadeBlock>
              <FadeBlock as="h2" once fast>
                {form.name}
              </FadeBlock>
              <FadeBlock as="p" className="body" once fast>
                {form.theory}
              </FadeBlock>
              <FadeBlock as="p" className="eg" once fast>
                {form.example}
              </FadeBlock>
            </div>
          </div>
        )}
      />

      <section id="bien-chung" className="quote-stage quote-stage--hegel quote-stage--portrait">
        <img className="stage-bg" src={IMAGES.quoteMarxDialectic} alt="" aria-hidden="true" loading="lazy" />
        <FadeBlock as="blockquote" className="quote-stage__blockquote" once fast>
          <q>{BIEN_CHUNG.marxQuote.text}</q>
          <footer>{BIEN_CHUNG.marxQuote.author}</footer>
        </FadeBlock>
      </section>

      <section className="sec sec-light statement-list">
        <div className="col">
          <RevealText as="span" className="eyebrow" text="Chương 03" />
          <RevealText as="h2" text={BIEN_CHUNG.headline} />
          {BIEN_CHUNG.coreAspects.map((aspect, index) => (
            <article className="statement-row" key={aspect.title}>
              <div className="statement-row__num">{`0${index + 1}`}</div>
              <div className="statement-row__copy">
                <RevealText as="h3" text={aspect.title} />
                <FadeBlock as="ul" className="points">
                  {aspect.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </FadeBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <WordCarousel
        className="sec-black"
        ariaLabel="Năm quy luật biểu hiện của ý thức xã hội"
        items={lawSlides}
        renderSlide={(law) => (
          <div className="feature-slide feature-slide--law">
            <img className="stage-bg" src={law.image} alt={law.title} loading="lazy" />
            <div className="feature-slide__copy feature-slide__copy--law">
              <FadeBlock as="span" className="eyebrow" once fast>
                {law.tag}
              </FadeBlock>
              <FadeBlock as="h2" once fast>
                {law.title}
              </FadeBlock>
              <FadeBlock as="p" className="body law-layer__theory" once fast>
                {law.theory}
              </FadeBlock>
              <div className="law-layer__case">
                <FadeBlock as="h3" once fast>
                  {law.caseTitle}
                </FadeBlock>
                <FadeBlock as="p" className="body" once fast>
                  {law.caseDesc}
                </FadeBlock>
              </div>
            </div>
          </div>
        )}
      />

      <section className="quote-stage quote-stage--portrait">
        <img className="stage-bg" src={IMAGES.quoteEngels} alt="" aria-hidden="true" loading="lazy" />
        <FadeBlock as="blockquote" className="quote-stage__blockquote" once fast>
          <q>{BIEN_CHUNG.engelsQuote.text}</q>
          <footer>{`${BIEN_CHUNG.engelsQuote.author} · ${BIEN_CHUNG.engelsQuote.source}`}</footer>
        </FadeBlock>
      </section>

      <section id="van-dung" className="quote-stage quote-stage--wide">
        <img className="stage-bg" src={IMAGES.quoteHoChiMinh} alt="" aria-hidden="true" loading="lazy" />
        <FadeBlock as="blockquote" className="quote-stage__blockquote" once fast>
          <q>{MISSING_CONTENT.hcmQuote.text}</q>
          <footer>{`${MISSING_CONTENT.hcmQuote.author} · ${MISSING_CONTENT.hcmQuote.source}`}</footer>
        </FadeBlock>
      </section>

      <section className="sec sec-dark case-section">
        <div className="case-section__intro col-wide">
          <RevealText as="span" className="eyebrow" text="Chương 04 — Vận dụng thực tiễn" />
        </div>
        {VAN_DUNG.caseStudies.map((study, index) => (
          <article
            className={`case-stage case-stage--fullbleed ${index === 1 ? "case-stage--doi-moi" : "case-stage--flood"}`}
            key={study.id}
          >
            <img
              className="stage-bg"
              src={index === 0 ? IMAGES.caseFlood : IMAGES.caseDoiMoi}
              alt={study.title}
              loading="lazy"
            />
            <div className="case-stage__copy">
              <RevealText as="h2" text={study.title} />
              <div className="case-stage__steps">
                {study.steps.map((step) => (
                  <div key={`${study.id}-${step.label}`} className="case-step">
                    <RevealText as="span" className="eyebrow" text={step.label} />
                    <RevealText as="h3" text={step.title} />
                    <FadeBlock as="ul" className="points">
                      {step.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </FadeBlock>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="sec sec-light stats-band">
        <div className="col-wide">
          <RevealText as="span" className="eyebrow" text="Thành tựu Đổi mới 1986" />
          <div className="stats-figures">
            {MISSING_CONTENT.doiMoiStats.map((stat, index) => (
            <article className="stats-figure" key={stat}>
              <div className="stats-figure__index">{`0${index + 1}`}</div>
              <FadeBlock as="p">{stat}</FadeBlock>
            </article>
          ))}
        </div>
        </div>
      </section>

      <section className="sec sec-black statement-list">
        <div className="col">
          <RevealText as="span" className="eyebrow" text="Tư liệu bổ sung" />
          <article className="statement-row statement-row--single">
            <div className="statement-row__copy">
              <RevealText as="h3" text="Vai trò phương pháp luận" />
              <FadeBlock as="p" className="body">
                {MISSING_CONTENT.mlnRole}
              </FadeBlock>
            </div>
          </article>
          <article className="statement-row statement-row--single">
            <div className="statement-row__copy">
              <RevealText as="h3" text="Tính kế thừa trong xây dựng văn hóa" />
              <FadeBlock as="p" className="body">
                {MISSING_CONTENT.inheritanceVietnam}
              </FadeBlock>
            </div>
          </article>
          <article className="statement-row statement-row--single">
            <div className="statement-row__copy">
              <RevealText as="h3" text="Dấu mốc lịch sử" />
              <FadeBlock as="ul" className="points">
                {MISSING_CONTENT.historicalBattles.map((battle) => (
                  <li key={battle}>{battle}</li>
                ))}
              </FadeBlock>
            </div>
          </article>
        </div>
      </section>

      <section id="ket-luan" className="sec sec-dark statement-list">
        <div className="col-wide">
          <RevealText as="span" className="eyebrow" text="Chương 05 — Bài học" />
          {VAN_DUNG.lessons.map((lesson, index) => (
            <article className="statement-row" key={lesson.title}>
              <div className="statement-row__num">{`0${index + 1}`}</div>
              <div className="statement-row__copy">
                <RevealText as="h3" text={lesson.title} />
                <FadeBlock as="ul" className="points">
                  {lesson.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </FadeBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sec sec-black statement-list">
        <div className="col-wide">
          <RevealText as="span" className="eyebrow" text="Hành động" />
          {VAN_DUNG.practicalActions.map((action, index) => (
            <article className="statement-row" key={action.title}>
              <div className="statement-row__num">{`0${index + 1}`}</div>
              <div className="statement-row__copy">
                <RevealText as="h3" text={action.title} />
                <FadeBlock as="p" className="body">
                  {action.body}
                </FadeBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="summary-stage sec-light">
        <div className="col summary-stage__copy">
          <FadeBlock as="p">{VAN_DUNG.summary.body}</FadeBlock>
          <FadeBlock as="p" className="closing">
            {VAN_DUNG.summary.closing}
          </FadeBlock>
        </div>
      </section>
    </div>
  );
}
