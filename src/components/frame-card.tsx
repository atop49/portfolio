"use client";

import Image from "next/image";
import type { Dossier } from "@/lib/project-dossier";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { splitDisplayTitle } from "@/lib/display-title";
import ExploreTrigger from "./explore-trigger";

/**
 * `image` is a vector illustration URL. The same source feeds both the color
 * and the grayscale layer, so real artwork can be swapped without changing the
 * card component.
 */
export type Project = {
  id: string;
  title: string;
  meta: string;
  kicker: string;
  /** Vector illustration used by both the card and the inspection table. */
  image: string;
  /** Deep project tint, multiplied over the illustration at low opacity. */
  themeColor: string;
  description: string;
  experienceHref?: string;
  externalHref?: string;
  /** 详情页左侧「项目档案」用到的扩展字段，见 lib/project-dossier.ts。 */
  longDescription?: Dossier["longDescription"];
  techStack?: Dossier["techStack"];
  process?: Dossier["process"];
  changelog?: Dossier["changelog"];
};

type FrameCardProps = {
  project: Project;
  isOpen: boolean;
  onOpen: (project: Project, source: HTMLElement) => void;
  /** 无限循环用的复制帧：只是视觉重复，不进 tab 顺序。 */
  isClone?: boolean;
};

/**
 * One film frame. A single still is enough now: the grade lives on the image
 * itself (`.frame-image`), so hovering crosses from a hard grayscale print to
 * full colour through one 300ms filter transition instead of cross-fading two
 * stacked copies.
 *
 * The transparent `.frame-hit` button is the single tab stop per frame. Its
 * focus reveals the action group; Enter opens the detail viewer. The action
 * buttons stay out of the tab order so Tab moves frame-to-frame, while the
 * same actions are fully keyboard reachable inside the detail dialog.
 */
export default function FrameCard({
  project,
  isOpen,
  onOpen,
  isClone = false,
}: FrameCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const quickTiltRef = useRef<{
    x: (value: number) => void;
    y: (value: number) => void;
  } | null>(null);
  const canTiltRef = useRef(false);
  const resetTiltRef = useRef<() => void>(() => {});
  const titleLines = splitDisplayTitle(project.title);

  // A small, pointer-only tilt on the image window. The sprocket bands stay
  // flat so the strip keeps its physical shape; tilting the whole card would
  // also enlarge the rect GSAP Flip measures when opening.
  useEffect(() => {
    const frameWindow = windowRef.current;
    if (!frameWindow) return;

    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    const resetTilt = () => {
      canTiltRef.current = false;
      quickTiltRef.current = null;
      gsap.killTweensOf(frameWindow);
      /* 只把角度归零、保留 transformPerspective：
         clearProps 会连 perspective() 一起清掉，下次 hover 就变成没有纵深的平面旋转。 */
      gsap.set(frameWindow, { rotationX: 0, rotationY: 0 });
    };

    const enableTilt = () => {
      /* 透视写在窗口自身，卡片上不再挂 perspective（见 globals.css .frame-card 注释）。 */
      gsap.set(frameWindow, { transformPerspective: 1100 });
      quickTiltRef.current = {
        x: gsap.quickTo(frameWindow, "rotationX", {
          duration: 0.38,
          ease: "power2.out",
        }),
        y: gsap.quickTo(frameWindow, "rotationY", {
          duration: 0.38,
        }),
      };
      canTiltRef.current = true;
    };

    const syncTilt = () => {
      if (media.matches) enableTilt();
      else resetTilt();
    };

    resetTiltRef.current = resetTilt;
    syncTilt();
    media.addEventListener("change", syncTilt);

    return () => {
      media.removeEventListener("change", syncTilt);
      resetTilt();
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!canTiltRef.current || !quickTiltRef.current || !cardRef.current) {
      return;
    }

    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;

    const rect = cardRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    // ±4° is enough to feel dimensional without warping the frame.
    quickTiltRef.current.y(px * 8);
    quickTiltRef.current.x(-py * 8);
  };

  /* 显影：把 --develop 逐帧推到 1。用 GSAP 而不是 CSS transition ——
     滚动时 --depth-dim 也是逐帧写进 style 的，那条路径已经证明不会闪；
     而「切换一条 CSS 规则 + transition」会让浏览器给图片重新建图层，
     在 preserve-3d 的胶片带里会连带重建整棵图层树，左邻卡被错裁一两帧。 */
  const setDevelop = (value: 0 | 1, immediate = false) => {
    const window = windowRef.current;
    if (!window) return;
    if (immediate) {
      gsap.set(window, { "--develop": value });
      return;
    }
    gsap.to(window, {
      "--develop": value,
      duration: 0.32,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handlePointerEnter = () => {
    setDevelop(1);
  };

  const handlePointerLeave = () => {
    setDevelop(0);
    resetTiltRef.current();
  };

  const freezeTilt = () => {
    const window = windowRef.current;
    if (!window) return;
    gsap.killTweensOf(window);
    gsap.set(window, { rotationX: 0, rotationY: 0 });
  };

  const open = () => {
    const card = cardRef.current;
    if (!card) return;
    freezeTilt();
    onOpen(project, card);
  };

  return (
    <article
      ref={cardRef}
      className="frame-card"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div className="frame-sprocket frame-sprocket-top" aria-hidden="true" />

      <div ref={windowRef} className="frame-window">
        {/* 显影 = 一个 --develop 变量：底层图片的滤镜同时受景深（--depth-dim）和它影响，
            hover 时用 GSAP 逐帧把这变量推到 1。不换 CSS 规则、不加 transition，
            和滚动时逐帧改 --depth-dim 走的是同一条路径——那条路径不闪。 */}
        <div className="frame-media" aria-hidden="true">
          <Image
            className="frame-image"
            src={project.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 28vw, 100vw"
            unoptimized
          />
          <div className="frame-scrim" />
        </div>

        <span className="frame-index" aria-hidden="true">
          {project.id}
        </span>

        <div className="frame-copy">
          <h2 className="frame-title">
            {titleLines.map((line, index) => (
              <span
                className={`frame-title-line${
                  index > 0 ? " is-second" : ""
                }`}
                key={`${line}-${index}`}
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="frame-actions" role="group" aria-label="项目操作">
          <ExploreTrigger
            label="查看详情"
            variant="row"
            tabIndex={-1}
            onActivate={open}
          />
        </div>
      </div>

      <div className="frame-sprocket frame-sprocket-bottom" aria-hidden="true" />

      {/* Full-card hit area: one tab stop per frame, native Enter/Space. */}
      <button
        type="button"
        className="frame-hit"
        aria-label={`查看《${project.title}》详情`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        tabIndex={isClone ? -1 : undefined}
        onClick={open}
      />
    </article>
  );
}
