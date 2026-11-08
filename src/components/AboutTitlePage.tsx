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

/* 演职员表：只写真实信息，不再放占位的假经历。 */
const CREDITS: CreditRow[] = [
  { label: "Location", value: "武汉, CN" },
  { label: "Education", value: "武汉理工大学 · 大二在读" },
  { label: "Focus", value: "AI 应用与开发 / 前端交互设计" },
  { label: "Interests", value: "电影和故事" },
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
            stagger: 0.1,
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
          <h1 id="about-title" className="about-name">
            WANG QI
          </h1>
          <p className="about-role">Student / AI learner</p>
        </header>

        <div className="about-body">
          <div className="about-notes" data-about-reveal>
            <p className="about-block-label">Director&rsquo;s note</p>
            <p>我是一名大二学生，目前正在深入学习 AI 及其相关技术。</p>
          </div>

          <div className="about-cast" data-about-reveal>
            <p className="about-block-label">Credits &amp; background</p>
            <dl className="about-credits">
              {CREDITS.map((row) => (
                <div className="about-credit-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <footer className="about-footer" data-about-reveal>
          <div className="about-links">
            <a href="mailto:348170342@qq.com">348170342@qq.com</a>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/atop49"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://x.com" target="_blank" rel="noreferrer noopener">
              X
            </a>
          </div>
          <a
            className="about-cta"
            href="https://github.com/atop49"
            target="_blank"
            rel="noreferrer noopener"
          >
            Get in touch
          </a>
          <p className="about-fin">Written, designed &amp; coded by myself</p>
        </footer>
      </div>

      <span className="about-ruler" aria-hidden="true" />
    </section>
  );
}
