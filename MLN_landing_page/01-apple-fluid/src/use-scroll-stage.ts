import { useEffect } from "react";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

type RevealBlock = {
  node: HTMLElement;
  words: HTMLElement[];
};

type SequenceBlock = {
  node: HTMLElement;
  items: HTMLElement[];
};

function updateWordReveal(blocks: RevealBlock[]) {
  const viewportHeight = window.innerHeight;

  blocks.forEach(({ node, words }) => {
    const rect = node.getBoundingClientRect();

    if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) {
      return;
    }

    const travel = viewportHeight + rect.height;
    const progress = clamp((viewportHeight - rect.top) / Math.max(travel, 1));
    const spread = words.length + 8;

    node.style.setProperty("--reveal-progress", progress.toFixed(4));

    words.forEach((word, index) => {
      const enterStart = index / spread;
      const exitStart = 0.84 + ((words.length - index - 1) / spread) * 0.08;
      const entrance = clamp((progress - enterStart) / 0.11);
      const exit = 1 - clamp((progress - exitStart) / 0.08);
      const opacity = clamp(Math.min(entrance, exit), 0.2, 1);
      const translateY = (1 - entrance) * 14 - (1 - exit) * 8;
      const blur = Math.max(0, 1 - opacity) * 7;

      word.style.setProperty("--word-opacity", opacity.toFixed(4));
      word.style.setProperty("--word-y", `${translateY.toFixed(2)}px`);
      word.style.setProperty("--word-blur", `${blur.toFixed(2)}px`);
    });
  });
}

function updateSequenceReveal(blocks: SequenceBlock[]) {
  const viewportHeight = window.innerHeight;

  blocks.forEach(({ node, items }) => {
    const rect = node.getBoundingClientRect();
    const scrollSpan = Math.max(node.offsetHeight - viewportHeight, 1);
    const progress = clamp((-rect.top + viewportHeight * 0.16) / scrollSpan);
    const steps = Math.max(items.length - 1, 1);
    const active = progress * steps;

    items.forEach((item, index) => {
      const delta = active - index;
      let opacity = 0;
      let translateY = 0;
      let blur = 0;

      if (delta > -0.52 && delta < 0.42) {
        if (delta < -0.16) {
          const t = clamp((delta + 0.52) / 0.36);
          opacity = t;
          translateY = (1 - t) * 18;
          blur = (1 - t) * 8;
        } else if (delta <= 0.14) {
          opacity = 1;
        } else {
          const t = 1 - clamp((delta - 0.14) / 0.28);
          opacity = t;
          translateY = -(1 - t) * 12;
          blur = (1 - t) * 6;
        }
      }

      item.style.setProperty("--sequence-opacity", opacity.toFixed(4));
      item.style.setProperty("--sequence-y", `${translateY.toFixed(2)}px`);
      item.style.setProperty("--sequence-blur", `${blur.toFixed(2)}px`);
    });
  });
}

export function useScrollStage() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-word-reveal]")).map((node) => ({
      node,
      words: Array.from(node.querySelectorAll<HTMLElement>("[data-word]")),
    }));
    const fadeNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-fade]"));
    const fadeOnceNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-fade-once]"));
    const sequences = Array.from(document.querySelectorAll<HTMLElement>("[data-sequence]")).map((node) => ({
      node,
      items: Array.from(node.querySelectorAll<HTMLElement>("[data-sequence-item]")),
    }));

    if (reduce) {
      blocks.forEach(({ words, node }) => {
        node.style.setProperty("--reveal-progress", "1");
        words.forEach((word) => {
          word.style.setProperty("--word-opacity", "1");
          word.style.setProperty("--word-y", "0px");
          word.style.setProperty("--word-blur", "0px");
        });
      });
      fadeNodes.forEach((node) => node.classList.add("is-visible"));
      fadeOnceNodes.forEach((node) => node.classList.add("is-visible"));
      sequences.forEach(({ items }) => {
        items.forEach((item, index) => {
          item.style.setProperty("--sequence-opacity", index === 0 ? "1" : "0");
          item.style.setProperty("--sequence-y", "0px");
          item.style.setProperty("--sequence-blur", "0px");
        });
      });
      return;
    }

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    fadeNodes.forEach((node) => fadeObserver.observe(node));

    const fadeOnceObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    fadeOnceNodes.forEach((node) => fadeOnceObserver.observe(node));

    let rafId = 0;
    const update = () => {
      updateWordReveal(blocks);
      updateSequenceReveal(sequences);
      rafId = 0;
    };

    const requestUpdate = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      fadeObserver.disconnect();
      fadeOnceObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);
}
