"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type CreditRow = {
  label: string;
  value: string;
};

const CREDITS: CreditRow[] = [
  { label: "Location", value: "Shanghai, CN" },
  { label: "Experience", value: "8 yrs · Design × Code" },
  { label: "Status", value: "Open for projects" },
  { label: "Focus", value: "Interfaces with a narrative" },
];

export default function AboutTitlePage() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const blocks =
      section.querySelectorAll<HTMLElement>("[data-about-reveal]");
    if (!blocks.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(blocks, { y: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(blocks, { y: 20, opacity: 0 });
      ScrollTrigger.batch(blocks, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.12,
            overwrite: true,
          }),
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="about-section"
      aria-labelledby="about-title"
    >
      <span className="about-watermark" aria-hidden="true">
        FIN
      </span>

      <div className="about-inner">
        <header className="about-header" data-about-reveal>
          <p className="about-eyebrow">End credits</p>
          <h1 id="about-title" className="about-name">
            王骐
          </h1>
          <p className="about-role">Independent developer &amp; designer</p>
        </header>

        <div className="about-notes">
          <p data-about-reveal>
            我相信界面是时间的艺术。比起静态的页面，我更在意一个人从进入、
            停留到离开的完整节奏——像一部电影，有开场、有呼吸、有收尾。
          </p>
          <p data-about-reveal>
            过去几年我在设计与代码之间来回穿行：白天搭建设计系统，深夜写
            动效原型。我享受把一个模糊的想法，打磨成可以被触摸、被滚动、
            被记住的体验。
          </p>
          <p data-about-reveal>
            这个网站本身也是作品之一。如果你在这里停留得比预期久了一点，
            那正是我想要的效果。
          </p>
        </div>

        <dl className="about-credits" data-about-reveal>
          {CREDITS.map((row) => (
            <div className="about-credit-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <footer className="about-footer" data-about-reveal>
          <div className="about-links">
            <a href="mailto:hello@example.com">hello@example.com</a>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              X
            </a>
          </div>
          <a className="about-cta" href="mailto:hello@example.com">
            Get in touch
          </a>
          <p className="about-fin">Written, designed &amp; coded by myself</p>
        </footer>
      </div>

      <span className="about-ruler" aria-hidden="true" />
    </section>
  );
}
