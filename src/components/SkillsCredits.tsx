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

/* 只写现在真的在做的事：AI 工具、前端基础、排版，以及日常在用的工具。 */
const ACTS: SkillAct[] = [
  {
    index: "01",
    title: "Capabilities",
    rows: [
      {
        category: "AI Tools",
        name: "AI 工具应用",
        desc: "能熟练使用各类大语言模型与 AI 生成工具辅助开发与设计，把想法快速推到可以验证的版本。",
      },
      {
        category: "Frontend",
        name: "前端基础开发",
        desc: "用 HTML / CSS / JS 与 React 搭出可交互的界面，从结构、状态到部署能独立走完一遍。",
      },
      {
        category: "Visual & Type",
        name: "视觉与排版设计",
        desc: "在意信息层级、留白与字距，用极简的排版把复杂的内容讲清楚。",
      },
    ],
  },
  {
    index: "02",
    title: "Tools",
    rows: [
      {
        category: "React",
        name: "组件化界面",
        desc: "用组件与状态组织界面，处理列表、筛选、动效这类真实交互。",
      },
      {
        category: "TypeScript",
        name: "类型化的前端",
        desc: "给数据与接口定好形状，让错误在编译期就暴露，而不是上线之后。",
      },
      {
        category: "Tailwind CSS",
        name: "原子化样式",
        desc: "用约束好的设计变量快速搭页面，保持间距、字级与颜色的一致性。",
      },
      {
        category: "GSAP",
        name: "时间线与滚动动效",
        desc: "把入场、转场与滚动叙事串在同一条时间线上，控制每一帧的节奏。",
      },
      {
        category: "Git & GitHub",
        name: "版本与部署",
        desc: "分支、提交、Actions 自动构建，把作品推到 GitHub Pages 上持续更新。",
      },
      {
        category: "LLM",
        name: "AI 辅助编码",
        desc: "把大模型当作结对伙伴：读文档、拆问题、审代码，而不是直接复制答案。",
      },
    ],
  },
  {
    index: "03",
    title: "Collaboration",
    rows: [
      {
        category: "Open Source",
        name: "开源社区学习",
        desc: "在别人的仓库里阅读实现、提 issue、看讨论，把社区当成第二课堂。",
      },
      {
        category: "Project-based",
        name: "项目驱动学习",
        desc: "先定一个想做成的东西，缺什么补什么，在交付里学，而不是在教程里学。",
      },
      {
        category: "Cross-disciplinary",
        name: "跨学科思考",
        desc: "把电影、摄影与叙事的经验带进代码，让界面除了好用，也值得被看。",
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
          一名对 AI 充满好奇的大二学生，正在探索技术与视觉的边界。
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
