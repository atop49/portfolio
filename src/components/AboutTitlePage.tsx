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

/* NOTE: 履历为占位内容，换成你自己的真实经历后再对外评审。 */
type ResumeEntry = {
  period: string;
  title: string;
  detail: string;
};

type ResumeGroup = {
  label: string;
  entries: ResumeEntry[];
};

const CREDITS: CreditRow[] = [
  { label: "Location", value: "Shanghai, CN" },
  { label: "Experience", value: "8 yrs · Design × Code" },
  { label: "Status", value: "Open for projects" },
  { label: "Focus", value: "Interfaces with a narrative" },
];

const RESUME: ResumeGroup[] = [
  {
    label: "学习经历",
    entries: [
      {
        period: "2016 — 2020",
        title: "视觉传达设计 · 本科",
        detail: "主修字体、版式与品牌，毕业设计拿到院级优秀",
      },
      {
        period: "2021",
        title: "交互设计与前端进阶",
        detail: "系统补完动效原理、Web 动画与可访问性",
      },
    ],
  },
  {
    label: "工作经历",
    entries: [
      {
        period: "2020 — 2022",
        title: "交互设计师 · 设计工作室",
        detail: "品牌官网与产品界面，从概念到交付全程参与",
      },
      {
        period: "2022 — 至今",
        title: "独立开发者 / 前端工程师",
        detail: "设计与代码一人完成，交付可上线的交互站点",
      },
    ],
  },
  {
    label: "荣誉奖项",
    entries: [
      {
        period: "2024",
        title: "CSS Design Awards · Special Kudos",
        detail: "个人作品站获当日站点提名",
      },
      {
        period: "2023",
        title: "Awwwards · Honorable Mention",
        detail: "动效叙事类项目获奖",
      },
      {
        period: "2020",
        title: "院级优秀毕业设计",
        detail: "以时间轴叙事为主题的视觉研究",
      },
    ],
  },
  {
    label: "兴趣爱好",
    entries: [
      {
        period: "—",
        title: "胶片摄影 · 35mm",
        detail: "随身一台旁轴，记录城市的光线变化",
      },
      {
        period: "—",
        title: "剪辑与配乐",
        detail: "DaVinci 调色、Ableton 做短片配乐",
      },
      {
        period: "—",
        title: "长跑 · 半程马拉松",
        detail: "个人最好成绩 1:52，跑步时想界面逻辑",
      },
    ],
  },
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
            王骐
          </h1>
          <p className="about-role">Frontend developer</p>
        </header>

        <dl className="about-credits" data-about-reveal>
          {CREDITS.map((row) => (
            <div className="about-credit-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="about-body">
          <div className="about-notes" data-about-reveal>
            <p className="about-block-label">Director&rsquo;s note</p>
            <p>
              我相信界面是时间的艺术。比起静态的页面，我更在意一个人从进入、
              停留到离开的完整节奏——像一部电影，有开场、有呼吸、有收尾。
            </p>
            <p>
              过去几年我在设计与代码之间来回穿行：白天搭建设计系统，深夜写
              动效原型。我享受把模糊的想法打磨成可以被触摸、被滚动、被记住的
              体验。
            </p>
          </div>

          <div className="about-resume" data-about-reveal>
            <p className="about-block-label">Credits &amp; background</p>
            {RESUME.map((group) => (
              <section className="about-resume-group" key={group.label}>
                <h2 className="about-resume-heading">{group.label}</h2>
                <ul className="about-resume-list">
                  {group.entries.map((entry) => (
                    <li
                      className="about-resume-item"
                      key={`${group.label}-${entry.title}`}
                    >
                      <span className="about-resume-period">
                        {entry.period}
                      </span>
                      <span className="about-resume-title">{entry.title}</span>
                      <span className="about-resume-detail">
                        {entry.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <footer className="about-footer" data-about-reveal>
          <div className="about-links">
            <a href="mailto:hello@example.com">hello@example.com</a>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/atop49"
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
