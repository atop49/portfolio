"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type SkillRow = {
  category: string;
  name: string;
  desc: string;
};

type SkillAct = {
  index: string;
  title: string;
  rows: SkillRow[];
};

const ACTS: SkillAct[] = [
  {
    index: "01",
    title: "Capabilities",
    rows: [
      {
        category: "Brand Identity",
        name: "品牌视觉设计",
        desc: "从策略到视觉落地的完整品牌体系构建。",
      },
      {
        category: "Motion & Interaction",
        name: "动态交互设计",
        desc: "用时间轴与状态过渡，让界面拥有叙事节奏。",
      },
      {
        category: "Creative Coding",
        name: "创意开发",
        desc: "把设计稿还原为可运行的交互体验，细节不妥协。",
      },
      {
        category: "Experience",
        name: "全链路体验规划",
        desc: "从首次触达到留存回访，规划完整的使用旅程。",
      },
    ],
  },
  {
    index: "02",
    title: "Tools",
    rows: [
      {
        category: "Figma",
        name: "界面与原型",
        desc: "高保真原型与设计系统搭建的主要工作台。",
      },
      {
        category: "Cinema 4D",
        name: "三维视觉",
        desc: "场景搭建、材质灯光与动态图形的三维表达。",
      },
      {
        category: "After Effects",
        name: "动态影像",
        desc: "片头、转场与复杂时间轴动效的合成输出。",
      },
      {
        category: "GSAP",
        name: "网页动效",
        desc: "以时间线和滚动触发实现电影级的网页叙事。",
      },
      {
        category: "Blender",
        name: "造型与渲染",
        desc: "开放流程下的建模、雕刻与写实渲染补充。",
      },
    ],
  },
  {
    index: "03",
    title: "Collaboration",
    rows: [
      {
        category: "Co-creation",
        name: "需求共创",
        desc: "与产品和业务一起定义问题，而不是只接需求。",
      },
      {
        category: "Agile",
        name: "敏捷迭代",
        desc: "小步快跑，用可验证的版本持续逼近正确解。",
      },
      {
        category: "Review",
        name: "设计走查",
        desc: "上线前逐像素核对还原度，守住体验底线。",
      },
      {
        category: "Mentoring",
        name: "带教指导",
        desc: "沉淀方法论，帮助团队新成员快速进入状态。",
      },
    ],
  },
];

export default function SkillsCredits() {
  const sectionRef = useRef<HTMLElement>(null);
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rows = section.querySelectorAll<HTMLElement>(".skills-item");
    if (!rows.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(rows, { y: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(rows, { y: 20, opacity: 0 });
      ScrollTrigger.batch(rows, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="skills-section"
      aria-labelledby="skills-title"
    >
      <span className="skills-watermark" aria-hidden="true">
        CREDITS
      </span>

      <div className="skills-inner">
        <header className="skills-header">
          <h1 id="skills-title" className="skills-sr-only">
            技能
          </h1>
        </header>

        <p className="skills-summary">
          一名擅长将视觉设计与前端代码结合的创作者。
        </p>

        <div className="skills-list-head">
          <p className="skills-list-label">Ability matrix</p>
          <button
            type="button"
            className="skills-toggle-all"
            aria-pressed={allOpen}
            aria-controls="skills-list"
            onClick={() => setAllOpen((value) => !value)}
          >
            {allOpen ? "收起全部" : "展开全部"}
          </button>
        </div>

        <ul
          id="skills-list"
          className={`skills-list${allOpen ? " is-expanded" : ""}`}
        >
          {ACTS.map((act) => (
            <li className="skills-act" key={act.index}>
              <h2 className="skills-act-title">
                <span>{act.index}</span>
                <span aria-hidden="true">/</span>
                <span>{act.title}</span>
              </h2>

              <ul className="skills-act-rows">
                {act.rows.map((row) => (
                  <li
                    className="skills-item"
                    key={`${act.index}-${row.category}`}
                    tabIndex={0}
                  >
                    <div className="skills-row">
                      <span className="skills-category">{row.category}</span>
                      <span className="skills-name">{row.name}</span>
                      <span className="skills-rule" aria-hidden="true" />
                    </div>
                    <div className="skills-note">
                      <p>{row.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
