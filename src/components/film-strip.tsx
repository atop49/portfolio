"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FrameCard, { type Project } from "./frame-card";
import ExploreTrigger from "./explore-trigger";
import TimelineNavigator from "./timeline-navigator";
import { splitDisplayTitle } from "@/lib/display-title";

/* GitHub Pages 部署在 /portfolio 子路径下，public 里的图片不会自动带前缀，
   这里手动拼一次；本地 dev 时 NEXT_PUBLIC_BASE_PATH 为空串。 */
const ASSET_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${ASSET_PREFIX}${path}`;

const PROJECTS: Project[] = [
  {
    id: "01",
    title: "待办事项",
    meta: "React 应用 · 2026",
    kicker: "Selected work",
    image: asset("/illustrations/todo.svg"),
    themeColor: "#1A1814",
    description:
      "剪辑台式的任务管理器。任务即素材条目：优先级徽记、时间码索引、统计读数，完成时划出淡出。React + TypeScript + Zustand + Tailwind。",
    experienceHref: "https://atop49.github.io/todo-studio/",
  },
  {
    id: "02",
    title: "Markdown 笔记",
    meta: "React 应用 · 2026",
    kicker: "Selected work",
    image: asset("/illustrations/notes.svg"),
    themeColor: "#F2ECDD",
    description:
      "明亮书房里的写作台：左侧等宽字稿纸，右侧杂志级实时预览，oneLight 亮色代码高亮，书架式笔记管理。React + TypeScript + react-markdown。",
    experienceHref: "https://atop49.github.io/notes-studio/",
  },
  {
    id: "03",
    title: "番茄钟",
    meta: "React 应用 · 2026",
    kicker: "Selected work",
    image: asset("/illustrations/pomodoro.svg"),
    themeColor: "#F5F1E6",
    description:
      "一整页留白，中央只悬一只圆环。专注 25 分钟、休息 5 分钟，暂停时数字呼吸，到点圆环跳动。React + TypeScript + Web Audio。",
    experienceHref: "https://atop49.github.io/pomodoro-studio/",
  },
  {
    id: "04",
    title: "天气",
    meta: "React 应用 · 2026",
    kicker: "Selected work",
    image: asset("/illustrations/weather.svg"),
    themeColor: "#E8F0F2",
    description:
      "亮色玻璃拟态的天气台：晨光磨砂卡片浮在纸白地面上，超大温度读数、五日预报横滚、收藏与定位。React + TypeScript + OpenWeatherMap。",
    experienceHref: "https://atop49.github.io/weather-studio/",
  },
  {
    id: "05",
    title: "潮汐",
    meta: "短片 · 2026",
    kicker: "Selected work",
    image: asset("/illustrations/tide.svg"),
    themeColor: "#F2EBD9",
    description:
      "一部关于退潮后留在沙滩上的记忆的短片。潮水带走了脚印，却留下了声音。",
  },
  {
    id: "06",
    title: "夜航",
    meta: "纪录片 · 2025",
    kicker: "Selected work",
    image: asset("/illustrations/coast.svg"),
    themeColor: "#D9E8E8",
    description:
      "跟随夜间货机穿越三座城市，记录塔台、跑道与黎明前最后一盏灯。",
  },
  {
    id: "07",
    title: "未寄出的信",
    meta: "实验影像 · 2025",
    kicker: "Selected work",
    image: asset("/illustrations/alpine.svg"),
    themeColor: "#E8D9D9",
    description:
      "用 16mm 残片重写一封没有地址的信。画面在显影液里缓慢浮出，又迅速褪去。",
  },
  {
    id: "08",
    title: "城市边缘",
    meta: "摄影 · 2024",
    kicker: "Selected work",
    image: asset("/illustrations/coast.svg"),
    themeColor: "#DCE4E8",
    description:
      "记录城乡接合部夜间灯火的摄影系列。每一扇亮着的窗，都是城市的一条边界。",
  },
  {
    id: "09",
    title: "午后三点",
    meta: "短片 · 2024",
    kicker: "Selected work",
    image: asset("/illustrations/alpine.svg"),
    themeColor: "#F0E2D2",
    description:
      "一个夏天午后，四个人在同一间屋子里等待。风扇转动，时间几乎停住。",
  },
  {
    id: "10",
    title: "回声",
    meta: "声音装置 · 2023",
    kicker: "Selected work",
    image: asset("/illustrations/tide.svg"),
    themeColor: "#E4DFEA",
    description:
      "在废弃剧院里搭建的声音装置。观众走入空场，脚步声被放大成一场没有乐手的演出。",
  },
  {
    id: "11",
    title: "北纬三十度",
    meta: "纪录片 · 2023",
    kicker: "Selected work",
    image: asset("/illustrations/alpine.svg"),
    themeColor: "#EADFD5",
    description:
      "沿北纬三十度线拍摄的地理纪录片。从高原到入海口，一条纬线串起不同的生活。",
  },
];

/**
 * Only this media query gets the scroll-driven horizontal treatment.
 * Mobile falls back to a vertical card flow, and reduced-motion users get a
 * normal vertical reading layout (both handled in CSS, without JS transforms).
 */
const DESKTOP_MOTION =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

const DETAIL_MOTION =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * 三段一模一样的胶片首尾相接：滚到第一段完全移出左边缘时，把轨道瞬间右移
 * 一个整段宽度。因为内容逐像素相同，观众看不到这次跳变——这就是无限循环。
 * 三段足够：一段宽度（11 帧 ≈ 4800px）远大于视口，中间那段永远能填满屏幕。
 */
const LOOP_COPIES = 3;
const LOOP_FRAMES = Array.from({ length: LOOP_COPIES }, (_, copy) =>
  PROJECTS.map((project) => ({ project, copy })),
).flat();

function revealSourceFrame(source: HTMLElement | null) {
  if (!source) return;

  // The card was held at opacity 0 for the closing Flip. Restore it without
  // replaying the base 240ms opacity transition, otherwise the source frame
  // fades in after the viewer has already closed.
  source.classList.remove("is-source-hidden");
  source.classList.add("is-source-restored");

  // Hold the just-closed state briefly before handing control back to the
  // normal hover/focus transitions.
  window.setTimeout(() => source.classList.remove("is-source-restored"), 200);
}

const FILM_EASE = "filmEase";

// The opening is deliberately a little slower than the exit: the frame has to
// travel across the viewport and the title has to hand off before the copy
// starts moving. The title carries a longer, softer clock than the media so it
// does not finish in a rush ahead of the copy.
const OPEN_FLIP_SECONDS = 0.8;
const TITLE_FLIGHT_SECONDS = 1;
const TITLE_EASE = "power2.inOut";

// GSAP is only needed in the browser. Registering at module scope makes the
// custom ease available to every open/close call, not just the first mount.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, CustomEase);
  CustomEase.create(FILM_EASE, "M0,0 C0.22,1 0.36,1 1,1");
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type FilmStripProps = {
  onThemeChange?: (themeColor: string | null) => void;
};

export default function FilmStrip({ onThemeChange }: FilmStripProps) {
  const runwayRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const mediaExperienceRef = useRef<HTMLDivElement>(null);
  const titleCloneRef = useRef<HTMLHeadingElement | null>(null);
  const justClosedTimerRef = useRef<number | null>(null);
  const justClosedSourceRef = useRef<HTMLElement | null>(null);

  const sourceRef = useRef<HTMLElement | null>(null);
  const sourceScaleRef = useRef(1);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  /** 检片台打开时把滚轮驱动暂停，避免背景胶片在对话框后面偷偷滑走。 */
  const motionControlRef = useRef<{
    pause: () => void;
    resume: () => void;
    navigate: (index: number) => void;
  } | null>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const openedRef = useRef<string | null>(null);
  const closingRef = useRef(false);

  const [selected, setSelected] = useState<Project | null>(null);
  /** 底部刻度尺的当前帧（0 起，对应 PROJECTS 下标）。 */
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const clearFlightTitle = useCallback(() => {
    titleCloneRef.current?.remove();
    titleCloneRef.current = null;
  }, []);

  const clearJustClosed = useCallback(() => {
    if (justClosedTimerRef.current !== null) {
      window.clearTimeout(justClosedTimerRef.current);
      justClosedTimerRef.current = null;
    }
    justClosedSourceRef.current?.classList.remove("is-just-closed");
    justClosedSourceRef.current = null;
  }, []);

  const markJustClosed = useCallback(
    (source: HTMLElement | null) => {
      clearJustClosed();
      if (!source) return;

      source.classList.add("is-just-closed");
      justClosedSourceRef.current = source;
      justClosedTimerRef.current = window.setTimeout(() => {
        source.classList.remove("is-just-closed");
        if (justClosedSourceRef.current === source) {
          justClosedSourceRef.current = null;
        }
        justClosedTimerRef.current = null;
      }, 200);
    },
    [clearJustClosed],
  );

  useEffect(() => () => clearJustClosed(), [clearJustClosed]);

  useEffect(() => {
    const runway = runwayRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!runway || !viewport || !track) return;

    // Register once on the client. No ScrollSmoother / Lenis: the page keeps
    // its native scroll position, and only the track's transform is animated.
    gsap.registerPlugin(ScrollTrigger, Flip);

    const mm = gsap.matchMedia();

    mm.add(DESKTOP_MOTION, () => {
      /* 3D 旋转木马（Cover Flow）：轨道本身只做水平平移，
         每一格的角度/纵深/缩放都由"它离屏幕中轴多远"算出来——
         正中那格正面朝人，两侧 ±45° 向内转、后退 200px、缩到 0.8。
         轨道内容复制三段，滑出一整段就瞬间平移回来，所以永远滑不到头。 */
      const WHEEL_SPEED = 0.9;
      const DAMPING = 0.12;
      const MAX_ANGLE = 45;
      const MAX_DEPTH = 200;
      const MIN_SCALE = 0.8;
      const SIDE_OPACITY = 0.6;

      let setWidth = 0;
      let pitch = 0;
      let lastInputAt = 0;
      let anchor = 0;
      let x = 0;
      let targetX = 0;
      let paused = false;

      const frames = Array.from(
        track.querySelectorAll<HTMLElement>(".film-frame"),
      );
      const cards = frames.map((frame) =>
        frame.querySelector<HTMLElement>(".frame-card"),
      );
      let frameCenters: number[] = [];
      let frameWidths: number[] = [];
      let measuredWidth = -1;

      const measure = () => {
        /* 复位的步长必须是"同一张卡片"在两个副本之间的位移差，
           不能用 scrollWidth / 3——那样会把两端各多出的一个 gap 摊进去，
           每绕一圈就悄悄错开几个像素。 */
        const perCopy = PROJECTS.length;
        setWidth =
          frames.length >= perCopy * 2
            ? frames[perCopy].offsetLeft - frames[0].offsetLeft
            : track.scrollWidth / LOOP_COPIES;
        frameCenters = frames.map(
          (frame) => frame.offsetLeft + frame.offsetWidth / 2,
        );
        frameWidths = frames.map((frame) => frame.offsetWidth);
        pitch =
          frameCenters.length > 1
            ? frameCenters[1] - frameCenters[0]
            : viewport.clientWidth;
        measuredWidth = viewport.clientWidth;
        /* 锚点：把第一格摆到屏幕正中的那个位移。
           复位与起点都以它为基准，滚动区间才不会偏到一边。 */
        const nextAnchor = viewport.clientWidth / 2 - frameCenters[0];
        if (anchor !== 0) {
          x += nextAnchor - anchor;
          targetX += nextAnchor - anchor;
        }
        anchor = nextAnchor;
      };
      measure();
      /* 起点退后整整一份：第一份留在左缘外，正中才是下一份的首帧，
         否则轨道右移后会露出左侧空白。 */
      x = anchor - setWidth;
      targetX = anchor - setWidth;

      const applyCarousel = () => {
        if (measuredWidth !== viewport.clientWidth) measure();
        const vw = viewport.clientWidth;
        const axis = vw / 2;
        let focusIndex = -1;
        let focusDelta = Infinity;

        for (let i = 0; i < frames.length; i += 1) {
          const frame = frames[i];
          const card = cards[i];
          const width = frameWidths[i] || 1;
          const center = frameCenters[i] + x;
          /* 以"卡宽"为单位的偏移：0 = 正中，1 = 相邻那一格。
             再 clamp 到 ±1.8，远处的帧不会继续转到背面去。 */
          const raw = (center - axis) / width;
          const t = Math.max(-1.8, Math.min(1.8, raw));
          const away = Math.min(Math.abs(t), 1);

          /* 右侧（t > 0）角度为负 → 卡片左转、朝内；左侧为正 → 右转、朝内。
             两侧同时后退并缩小，围出一个以中轴为圆心的弧。 */
          const angle = -MAX_ANGLE * t;
          const depth = -MAX_DEPTH * away;
          const scale = 1 - (1 - MIN_SCALE) * away;
          const opacity = 1 - (1 - SIDE_OPACITY) * away;

          /* 侧格先往中轴收一点，再旋转后退：45deg 的侧转本身就把卡片
             往外甩，不收这一下左右邻居只剩一条边露在视口里。 */
          const pull = -t * 110;
          frame.style.transform = `translateX(${pull.toFixed(1)}px) rotateY(${angle.toFixed(2)}deg) translateZ(${depth.toFixed(1)}px) scale(${scale.toFixed(3)})`;
          frame.style.opacity = opacity.toFixed(3);
          /* 0 = 正中（彩色、明亮），1 = 两侧（黑白、压暗）；
             画面滤镜与投影都由这个变量在 CSS 里换算。 */
          card?.style.setProperty("--depth-dim", away.toFixed(3));

          const delta = Math.abs(center - axis);
          if (delta < focusDelta) {
            focusDelta = delta;
            focusIndex = i;
          }
        }

        // 正中那格换算成第几个项目，喂给底部刻度尺。
        // 只在真的换帧时 setState，免得每帧都触发一次 React 渲染。
        if (focusIndex >= 0) {
          const projectIndex = focusIndex % PROJECTS.length;
          if (projectIndex !== activeIndexRef.current) {
            activeIndexRef.current = projectIndex;
            setActiveIndex(projectIndex);
          }
        }
      };

      const onWheel = (event: WheelEvent) => {
        if (paused || event.ctrlKey) return;
        event.preventDefault();
        const unit =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? viewport.clientHeight
              : 1;
        const delta = event.deltaY * unit;
        // 向下滚（deltaY > 0）→ 轨道 x 变小 → 卡片整体向左转。
        targetX -= delta * WHEEL_SPEED;
        lastInputAt = performance.now();
      };
      viewport.addEventListener("wheel", onWheel, { passive: false });

      /* 键盘用户：Tab 到某张卡片时把它送到屏幕正中。 */
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null;
        /* 只对键盘焦点让位：鼠标点击同样会触发 focus，若这时把胶片滑走，
           mousedown 与 mouseup 会落在不同元素上，点击就作废了。 */
        if (!target || !target.matches(":focus-visible")) return;
        const frame = target.closest(".film-frame") as HTMLElement | null;
        if (!frame) return;
        const index = frames.indexOf(frame);
        if (index < 0) return;
        targetX = viewport.clientWidth / 2 - frameCenters[index];
      };
      viewport.addEventListener("focusin", onFocusIn);

      const tick = () => {
        if (paused) return;

        /* 松手后吸附：始终让一格停在中轴上，
           否则滚轮停下时常卡在两格之间，正中就没有『那张卡』。 */
        if (pitch > 0 && performance.now() - lastInputAt > 140) {
          targetX = anchor + Math.round((targetX - anchor) / pitch) * pitch;
        }

        x += (targetX - x) * DAMPING;

        // 无缝复位：x 落在一整段之外时平移回来，targetX 同步，阻尼不变。
        if (setWidth > 0) {
          while (x < anchor - setWidth) {
            x += setWidth;
            targetX += setWidth;
          }
          while (x > anchor) {
            x -= setWidth;
            targetX -= setWidth;
          }
        }

        gsap.set(track, { x });
        applyCarousel();
      };
      gsap.ticker.add(tick);

      /**
       * 刻度导航：把第 index 个项目送到屏幕正中。
       * 三段副本里挑离中轴最近的那一份，算出它要补的位移；
       * 直接把结果写进 targetX，让既有的阻尼循环去完成缓动——
       * 不必另起一条 tween，也不会打乱 x 的复位区间。
       */
      const navigateTo = (index: number) => {
        const total = PROJECTS.length;
        const target = ((index % total) + total) % total;
        const focus = viewport.clientWidth / 2;
        let bestCenter = 0;
        let bestDistance = Infinity;
        for (let copy = 0; copy < LOOP_COPIES; copy += 1) {
          const i = copy * total + target;
          if (i >= frameCenters.length) continue;
          const screen = frameCenters[i] + x;
          const distance = Math.abs(screen - focus);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestCenter = screen;
          }
        }
        targetX = x + (focus - bestCenter);
      };

      motionControlRef.current = {
        pause: () => {
          paused = true;
        },
        resume: () => {
          paused = false;
        },
        navigate: navigateTo,
      };

      const refresh = () => {
        measure();
        applyCarousel();
      };

      // Web fonts can change the track width after the first measurement.
      document.fonts?.ready.then(refresh);
      window.addEventListener("resize", refresh);

      return () => {
        viewport.removeEventListener("wheel", onWheel);
        viewport.removeEventListener("focusin", onFocusIn);
        window.removeEventListener("resize", refresh);
        motionControlRef.current = null;
        gsap.ticker.remove(tick);
        gsap.set(track, { clearProps: "transform" });
        for (let i = 0; i < frames.length; i += 1) {
          frames[i].style.removeProperty("transform");
          frames[i].style.removeProperty("opacity");
          cards[i]?.style.removeProperty("--depth-dim");
        }
      };
    });

    return () => mm.revert();
  }, []);

  /* Hint that the strip is driven by the wheel: a slow, barely-there float.
     Runs on every breakpoint it is visible at; disabled for reduced motion. */
  useEffect(() => {
    const hint = hintRef.current;
    if (!hint || prefersReducedMotion()) return;
    const tween = gsap.to(hint, {
      y: -5,
      duration: 2.1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
      gsap.set(hint, { clearProps: "transform" });
    };
  }, []);

  const openDetail = useCallback(
    (project: Project, source: HTMLElement) => {
      if (selected?.id === project.id) return;

      // Rapid frame-to-frame switching: stop the previous flight before
      // replacing the source rect and the selected project.
      openTlRef.current?.kill();
      openTlRef.current = null;
      closeTlRef.current?.kill();
      closeTlRef.current = null;
      closingRef.current = false;
      clearFlightTitle();
      clearJustClosed();

      revealSourceFrame(sourceRef.current);
      sourceRef.current
        ?.querySelector<HTMLElement>(".frame-title")
        ?.classList.remove("is-title-returning");
      stageRef.current?.classList.remove("is-returning");
      sourceRef.current = source;
      restoreFocusRef.current = source;
      setSelected(project);
    },
    [clearFlightTitle, clearJustClosed, selected],
  );

  const closeDetail = useCallback(() => {
    if (!selected) return;

    clearFlightTitle();

    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const media = mediaRef.current;
    const info = infoRef.current;
    const closeButton = closeRef.current;
    const title = titleRef.current;
    const titleInner = titleInnerRef.current;
    const kicker = kickerRef.current;
    const meta = metaRef.current;
    const description = descriptionRef.current;
    const actions = actionsRef.current;
    const mediaExperience = mediaExperienceRef.current;

    // A second close request while the exit is running is an interrupt, not a
    // duplicate. Kill the exit timeline and fly back from the state currently
    // on screen instead of restarting the opening from zero.
    if (closingRef.current) {
      closeTlRef.current?.kill();
      closeTlRef.current = null;
      closingRef.current = false;
      openTlRef.current?.kill();
      openTlRef.current = null;

      if (
        !overlay ||
        !backdrop ||
        !media ||
        !info ||
        !closeButton ||
        !title ||
        !titleInner ||
        !kicker ||
        !meta ||
        !description ||
        !actions
      )
        return;

      closeButton.focus({ preventScroll: true });
      // If the interrupted close had already started a title return, put the
      // real detail title back before the reopen animation takes over.
      gsap.set(title, { autoAlpha: 1 });
      sourceRef.current
        ?.querySelector<HTMLElement>(".frame-title")
        ?.classList.remove("is-title-returning");
      clearJustClosed();

      const animateFlip = window.matchMedia(DETAIL_MOTION).matches;

      if (!animateFlip) {
        const tl = gsap.timeline({
          onComplete: () => {
            openTlRef.current = null;
          },
        });
        tl.to([overlay, backdrop], {
          autoAlpha: 1,
          duration: 0.22,
          ease: "power2.out",
        });
        openTlRef.current = tl;
        return;
      }

      stageRef.current?.classList.remove("is-returning");
      stageRef.current?.classList.add("is-inspecting");

      const state = Flip.getState(media);
      gsap.set(media, {
        clearProps:
          "position,left,top,width,height,margin,transform,transformOrigin",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          openTlRef.current = null;
        },
      });
      tl.to(
        backdrop,
        { autoAlpha: 0.88, duration: 0.3, ease: "power2.out" },
        0,
      );
      tl.to(
        [title, kicker, meta, description, actions],
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0,
      );
      if (mediaExperience) {
        tl.to(
          mediaExperience,
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
          0,
        );
      }
      tl.to(
        titleInner,
        { yPercent: 0, duration: 0.3, ease: "power2.out" },
        0,
      );
      tl.to(
        closeButton,
        { opacity: 1, duration: 0.2, ease: "power2.out" },
        0,
      );
      tl.add(
        Flip.from(state, {
          duration: 0.8,
          ease: FILM_EASE,
          scale: true,
          absolute: true,
        }),
        0,
      );
      openTlRef.current = tl;
      return;
    }

    if (
      !overlay ||
      !backdrop ||
      !media ||
      !info ||
      !closeButton ||
      !title ||
      !titleInner ||
      !kicker ||
      !meta ||
      !description ||
      !actions
    )
      return;

    closingRef.current = true;

    const source = sourceRef.current;
    const sourceTitle = source?.querySelector<HTMLElement>(".frame-title") ?? null;

    // A close during the opening Flip must win over the remaining timeline.
    openTlRef.current?.kill();
    openTlRef.current = null;

    const finish = () => {
      closeTlRef.current = null;
      closingRef.current = false;
      // Hide the viewer before revealing the source at the same rect. React
      // unmounts the overlay on the next commit; without this the landed media
      // and the source can both be painted for one frame.
      gsap.set(overlay, { autoAlpha: 0 });
      clearFlightTitle();
      sourceTitle?.classList.remove("is-title-returning");
      revealSourceFrame(source);
      markJustClosed(source);
      stageRef.current?.classList.remove("is-inspecting");
      // Keep `is-returning` until focus lands on the source, so other frames
      // do not flash back to full brightness for one frame.
      setSelected(null);
      motionControlRef.current?.resume();
    };

    const animateFlip =
      Boolean(source) && window.matchMedia(DETAIL_MOTION).matches;

    if (!animateFlip) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to([overlay, backdrop], {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.out",
      });
      closeTlRef.current = tl;
      return;
    }

    // 轨道是滚轮驱动的，检片台打开时已经暂停，位置不会再动，
    // 这里直接量取卡片外框作为返航目标即可。
    const baseRect = source!.getBoundingClientRect();
    const sourceScale = sourceScaleRef.current || 1;
    const width = baseRect.width * sourceScale;
    const height = baseRect.height * sourceScale;
    const rect = {
      left: baseRect.left + (baseRect.width - width) / 2,
      top: baseRect.top + (baseRect.height - height) / 2,
      width,
      height,
    };
    const state = Flip.getState(media);

    gsap.set(media, {
      position: "fixed",
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      margin: 0,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: "top left",
    });

    // Mirror the opening title flight: the detail title becomes a fixed clone
    // and travels back to the frame's own title before the source is revealed.
    // The source title is hidden until the handoff so the two never overlap.
    let returnTitle: HTMLHeadingElement | null = null;
    let returnTitleX = 0;
    let returnTitleY = 0;
    let returnTitleScale = 1;

    if (sourceTitle) {
      const titleRect = title.getBoundingClientRect();
      const titleTextRect = titleInner.getBoundingClientRect();
      const sourceTitleRect = sourceTitle.getBoundingClientRect();
      const titleScale =
        titleTextRect.height > 0
          ? sourceTitleRect.height / titleTextRect.height
          : 1;

      const clone = title.cloneNode(true) as HTMLHeadingElement;
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("film-detail-title-clone");
      const cloneInner = clone.querySelector<HTMLElement>(
        ".film-detail-title-inner",
      );
      if (cloneInner) gsap.set(cloneInner, { yPercent: 0 });

      gsap.set(clone, {
        position: "fixed",
        left: titleRect.left,
        top: titleRect.top,
        width: titleRect.width,
        margin: 0,
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: "0 0",
        autoAlpha: 1,
      });

      overlay.appendChild(clone);
      titleCloneRef.current = clone;
      returnTitle = clone;
      returnTitleX = sourceTitleRect.left - titleRect.left;
      returnTitleY = sourceTitleRect.top - titleRect.top;
      returnTitleScale = titleScale;

      // The clone owns the title during the exit; the source keeps its title
      // box but hides its face until the clone lands.
      gsap.set(title, { autoAlpha: 0 });
      sourceTitle.classList.add("is-title-returning");
    }

    const tl = gsap.timeline({ onComplete: finish });
    // Copy leaves in reverse reading order while the title is still flying.
    if (returnTitle) {
      tl.to(
        [description, actions],
        { autoAlpha: 0, y: -10, duration: 0.2, ease: "power2.out" },
        0,
      );
      if (mediaExperience) {
        tl.to(
          mediaExperience,
          { autoAlpha: 0, y: -10, duration: 0.2, ease: "power2.out" },
          0,
        );
      }
      tl.to(
        meta,
        { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.out" },
        0.04,
      );
      tl.to(
        kicker,
        { autoAlpha: 0, y: -6, duration: 0.2, ease: "power2.out" },
        0.08,
      );
    } else {
      // No source title to fly back to: keep the old opacity-only exit.
      tl.to(
        [title, kicker, meta, description, actions],
        { autoAlpha: 0, duration: 0.2, ease: "power2.out" },
        0,
      );
      if (mediaExperience) {
        tl.to(
          mediaExperience,
          { autoAlpha: 0, duration: 0.2, ease: "power2.out" },
          0,
        );
      }
    }
    tl.to(closeButton, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0);
    if (returnTitle) {
      tl.to(
        returnTitle,
        {
          x: returnTitleX,
          y: returnTitleY,
          scale: returnTitleScale,
          duration: 0.8,
          ease: TITLE_EASE,
        },
        0,
      );
    }
    // Symmetric reverse: the same 800ms / filmEase as the opening.
    tl.add(
      Flip.from(state, {
        duration: 0.8,
        ease: FILM_EASE,
        scale: true,
        absolute: true,
      }),
      0,
    );
    // Give the frame its text back at 85% of the return, while the flight is
    // still settling, instead of popping in after the Flip has finished.
    tl.call(
      () => {
        revealSourceFrame(source);
      },
      undefined,
      0.68,
    );
    // Hand the still over to the restored frame as it lands: by 68% the Flip
    // is visually at the source rect, so this crossfade cannot read as a jump.
    tl.to(media, { opacity: 0, duration: 0.12, ease: "power2.out" }, 0.68);
    // Recover the other frames only near the end, after the media is most of
    // the way home. The CSS recovery itself is 400ms.
    tl.call(
      () => {
        const stage = stageRef.current;
        stage?.classList.remove("is-inspecting");
        stage?.classList.add("is-returning");
      },
      undefined,
      0.56,
    );
    // Let the backdrop clear from 40% of the return; 450ms means it is nearly
    // gone as the media lands, without exposing the strip first.
    tl.to(
      backdrop,
      { autoAlpha: 0, duration: 0.45, ease: "power2.out" },
      0.32,
    );

    closeTlRef.current = tl;
  }, [clearJustClosed, clearFlightTitle, markJustClosed, selected]);

  // Run the opening animation only after the dialog exists. Keeping the root
  // hidden in its initial inline style prevents a full-screen flash.
  useEffect(() => {
    if (!selected) {
      openedRef.current = null;
      return;
    }
    if (openedRef.current === selected.id) return;

    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const media = mediaRef.current;
    const info = infoRef.current;
    const closeButton = closeRef.current;
    const title = titleRef.current;
    const titleInner = titleInnerRef.current;
    const kicker = kickerRef.current;
    const meta = metaRef.current;
    const description = descriptionRef.current;
    const actions = actionsRef.current;
    const mediaExperience = mediaExperienceRef.current;
    const source = sourceRef.current;

    if (
      !overlay ||
      !backdrop ||
      !media ||
      !info ||
      !closeButton ||
      !title ||
      !titleInner ||
      !kicker ||
      !meta ||
      !description ||
      !actions
    )
      return;

    openedRef.current = selected.id;
    closingRef.current = false;
    closeTlRef.current?.kill();
    closeTlRef.current = null;
    openTlRef.current?.kill();
    openTlRef.current = null;
    clearFlightTitle();

    // Hold the current scroll progress; do not refresh or reset it.
    motionControlRef.current?.pause();

    const animateFlip =
      Boolean(source) && window.matchMedia(DETAIL_MOTION).matches;
    const reduced = prefersReducedMotion();
    const sourceTitle =
      animateFlip && source
        ? source.querySelector<HTMLElement>(".frame-title")
        : null;
    const useFlight = Boolean(animateFlip && source && sourceTitle);

    // Only the real Flip path dims/scales the rest of the strip. Mobile and
    // reduced-motion keep the strip untouched and use an opacity-only fade.
    if (animateFlip) {
      stageRef.current?.classList.remove("is-returning");
      stageRef.current?.classList.add("is-inspecting");
    }

    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(backdrop, { autoAlpha: 0 });
    gsap.set(closeButton, { opacity: 0, visibility: "visible" });
    gsap.set([kicker, meta], { autoAlpha: 0, y: animateFlip ? 8 : 0 });
    gsap.set([description, actions], { autoAlpha: 0, y: animateFlip ? 12 : 0 });
    if (mediaExperience) {
      gsap.set(mediaExperience, {
        autoAlpha: 0,
        y: animateFlip ? 12 : 0,
      });
    }
    // The flying title is a clone of the frame title. The real title stays
    // hidden until the clone has landed, so no two title faces ever overlap.
    gsap.set(titleInner, { yPercent: 0 });
    gsap.set(title, { autoAlpha: 0 });

    let state: ReturnType<typeof Flip.getState> | null = null;
    let flightTitle: HTMLHeadingElement | null = null;

    if (animateFlip && source) {
      const rect = source.getBoundingClientRect();
      // Remember how developed the source looked when it was opened. The
      // pointer leaves the card as the overlay arrives, so the close target
      // must restore this same rendered rect, not the resting 1.0 rect.
      sourceScaleRef.current =
        source.offsetWidth > 0 ? rect.width / source.offsetWidth : 1;

      // Hide the source frame's content before the flying copy appears, so the
      // card and the detail media never read as two images at once.
      source.classList.remove("is-source-restored");
      source.classList.add("is-source-hidden");

      // Park the detail image on the exact card rect, let Flip measure that
      // state, then let it animate into its final inspection-table layout.
      gsap.set(media, {
        position: "fixed",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        margin: 0,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "top left",
      });
      state = Flip.getState(media);
      gsap.set(media, {
        clearProps:
          "position,left,top,width,height,margin,transform,transformOrigin",
      });
      gsap.set(media, { opacity: 1 });

      if (useFlight && sourceTitle) {
        const sourceRect = sourceTitle.getBoundingClientRect();
        const targetRect = title.getBoundingClientRect();
        const targetTextRect = titleInner.getBoundingClientRect();
        const scale =
          targetTextRect.height > 0
            ? sourceRect.height / targetTextRect.height
            : 1;

        // Clone the real detail title so its final line breaks and type
        // metrics are exact; only transform/opacity are animated.
        const clone = title.cloneNode(true) as HTMLHeadingElement;
        clone.removeAttribute("id");
        clone.setAttribute("aria-hidden", "true");
        clone.classList.add("film-detail-title-clone");
        const cloneInner = clone.querySelector<HTMLElement>(
          ".film-detail-title-inner",
        );
        if (cloneInner) gsap.set(cloneInner, { yPercent: 0 });

        gsap.set(clone, {
          position: "fixed",
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          margin: 0,
          x: sourceRect.left - targetRect.left,
          y: sourceRect.top - targetRect.top,
          scale,
          transformOrigin: "0 0",
          autoAlpha: 1,
        });

        overlay.appendChild(clone);
        titleCloneRef.current = clone;
        flightTitle = clone;
      }
    } else {
      gsap.set(media, { opacity: 0 });
    }

    gsap.set(overlay, { autoAlpha: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        openTlRef.current = null;
      },
    });
    tl.to(
      backdrop,
      {
        autoAlpha: 0.88,
        duration: reduced ? 0.22 : 0.5,
        ease: "power2.out",
      },
      0,
    );

    if (state) {
      tl.add(
        Flip.from(state, {
          duration: OPEN_FLIP_SECONDS,
          ease: FILM_EASE,
          scale: true,
          absolute: true,
        }),
        0,
      );
    } else {
      tl.to(
        media,
        {
          opacity: 1,
          duration: 0.22,
          ease: "power2.out",
        },
        0,
      );
    }

    if (flightTitle) {
      // The title travels out of the frame with the media on the same clock.
      tl.to(
        flightTitle,
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: TITLE_FLIGHT_SECONDS,
          ease: TITLE_EASE,
        },
        0,
      );
      // Swap at the exact end of the flight: the clone is already sitting on
      // the real title's box, so the handoff cannot crop or double a glyph.
      tl.call(
        () => {
          if (!flightTitle) return;
          gsap.set(title, { autoAlpha: 1 });
          flightTitle.remove();
          if (titleCloneRef.current === flightTitle) {
            titleCloneRef.current = null;
          }
        },
        undefined,
        TITLE_FLIGHT_SECONDS,
      );
      // Media lands first, then the copy stacks at 0 / 100 / 180ms.
      tl.to(
        kicker,
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        TITLE_FLIGHT_SECONDS,
      );
      tl.to(
        meta,
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        TITLE_FLIGHT_SECONDS + 0.1,
      );
      tl.to(
        [description, actions],
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
        TITLE_FLIGHT_SECONDS + 0.18,
      );
      if (mediaExperience) {
        tl.to(
          mediaExperience,
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
          TITLE_FLIGHT_SECONDS + 0.24,
        );
      }
    } else {
      // Mobile / reduced-motion: opacity only, no travel, no reveal.
      tl.to(
        [title, kicker, meta],
        { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
        0,
      );
      tl.to(
        [description, actions],
        { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
        0.06,
      );
      if (mediaExperience) {
        tl.to(
          mediaExperience,
          { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
          0.1,
        );
      }
    }

    tl.to(
      closeButton,
      { opacity: 1, duration: reduced ? 0.22 : 0.35, ease: "power2.out" },
      state ? 0.6 : 0,
    );

    openTlRef.current = tl;
  }, [clearFlightTitle, selected]);

  // 检片台里的媒体卡：指针在画幅上移动时整张相纸做 ±12° 的 3D 倾斜，
  // 一层径向高光贴着指针走；指针离开时用 elastic 曲线回正，像被弹簧拉住。
  // Flip 只量外层容器，倾斜只写在内层 plate 上，两者互不打扰。
  useEffect(() => {
    const media = mediaRef.current;
    const plate = plateRef.current;
    if (!selected || !media || !plate) return;
    if (prefersReducedMotion()) return;

    const MAX_TILT = 5;
    const glare = plate.querySelector<HTMLElement>(".media-glare");

    let rotateX: ((value: number) => void) | null = null;
    let rotateY: ((value: number) => void) | null = null;
    let scale: ((value: number) => void) | null = null;
    let liftX: ((value: number) => void) | null = null;
    let liftY: ((value: number) => void) | null = null;

    // quickTo 的底层是一个常驻 tween，被 kill 掉之后必须重建。
    const buildSetters = () => {
      rotateX = gsap.quickTo(plate, "rotationX", {
        duration: 0.45,
        ease: "power2.out",
      });
      rotateY = gsap.quickTo(plate, "rotationY", {
        duration: 0.45,
        ease: "power2.out",
      });
      scale = gsap.quickTo(plate, "scale", {
        duration: 0.45,
        ease: "power2.out",
      });
      liftX = gsap.quickTo(media, "--media-lift-x", {
        duration: 0.6,
        ease: "power2.out",
      });
      liftY = gsap.quickTo(media, "--media-lift-y", {
        duration: 0.6,
        ease: "power2.out",
      });
    };

    gsap.set(plate, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    });
    buildSetters();

    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    // 指针事件合并到一帧里处理，每帧只读一次 rect。
    const apply = () => {
      frame = 0;
      if (!pointer) return;
      const rect = media.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const px = (pointer.x - rect.left) / rect.width;
      const py = (pointer.y - rect.top) / rect.height;
      const nx = gsap.utils.clamp(-0.5, 0.5, px - 0.5);
      const ny = gsap.utils.clamp(-0.5, 0.5, py - 0.5);
      // 鼠标向上 → 卡片前倾；向右 → 卡片右倾。
      rotateY?.(nx * MAX_TILT * 2);
      rotateX?.(-ny * MAX_TILT * 2);
      // 投影朝指针的反方向让开，倾斜越狠让得越多。
      liftX?.(nx * -18);
      liftY?.(ny * -10);
      if (glare) {
        glare.style.setProperty("--glare-x", `${(px * 100).toFixed(2)}%`);
        glare.style.setProperty("--glare-y", `${(py * 100).toFixed(2)}%`);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onPointerEnter = () => {
      gsap.killTweensOf(plate);
      buildSetters();
      scale?.(1.01);
      if (glare) gsap.to(glare, { opacity: 1, duration: 0.35, ease: "power2.out" });
    };

    const onPointerLeave = () => {
      pointer = null;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      // 收掉所有常驻 tween，才能让回弹独占这几个属性。
      gsap.killTweensOf(plate);
      rotateX = rotateY = scale = null;
      gsap.to(plate, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
      liftX?.(0);
      liftY?.(0);
      if (glare) gsap.to(glare, { opacity: 0, duration: 0.4, ease: "power2.out" });
    };

    const onVisibility = () => {
      if (document.hidden) onPointerLeave();
    };

    media.addEventListener("pointerenter", onPointerEnter);
    media.addEventListener("pointermove", onPointerMove);
    media.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      media.removeEventListener("pointerenter", onPointerEnter);
      media.removeEventListener("pointermove", onPointerMove);
      media.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf(plate);
      if (glare) gsap.killTweensOf(glare);
      gsap.set(plate, { clearProps: "transform" });
      media.style.removeProperty("--media-lift-x");
      media.style.removeProperty("--media-lift-y");
    };
  }, [selected]);
  // Lock the page behind the dialog and keep the scrollbar gutter stable.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("detail-open", Boolean(selected));
    return () => root.classList.remove("detail-open");
  }, [selected]);

  // The site shell owns the theme variables so the page can also turn light
  // for the skills view. Report the selected project tint upward instead of
  // writing global variables here.
  useEffect(() => {
    onThemeChange?.(selected?.themeColor ?? null);
  }, [onThemeChange, selected]);

  // The strip is inert while the dialog is open; the dialog is its replacement.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (selected) {
      stage.setAttribute("inert", "");
      stage.setAttribute("aria-hidden", "true");
    } else {
      stage.removeAttribute("inert");
      stage.removeAttribute("aria-hidden");
    }

    return () => {
      stage.removeAttribute("inert");
      stage.removeAttribute("aria-hidden");
    };
  }, [selected]);

  // Focus the close control only after the strip has become inert. Doing it in
  // the opening timeline can be undone when the inert attribute lands.
  useEffect(() => {
    if (!selected) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) closeRef.current?.focus({ preventScroll: true });
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected]);

  // Return focus to the exact frame that opened the viewer after it unmounts.
  useEffect(() => {
    if (selected) return;
    const source = restoreFocusRef.current;
    if (!source) return;

    restoreFocusRef.current = null;
    const hit = source.querySelector<HTMLButtonElement>(".frame-hit");
    let returnTimer = 0;
    const frame = requestAnimationFrame(() => {
      hit?.focus({ preventScroll: true });
      // Let the 400ms recovery land before handing the stage back to sticky
      // flow. Removing this at the same frame as the focus cuts that run short.
      returnTimer = window.setTimeout(() => {
        stageRef.current?.classList.remove("is-returning");
      }, 160);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (returnTimer) window.clearTimeout(returnTimer);
    };
  }, [selected]);

  // ESC closes; Tab is trapped in the dialog's focusable controls.
  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetail();
        return;
      }

      if (event.key !== "Tab") return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeDetail, selected]);

  useEffect(() => {
    const stage = stageRef.current;
    return () => {
      openTlRef.current?.kill();
      closeTlRef.current?.kill();
      clearFlightTitle();
      sourceRef.current?.classList.remove("is-source-hidden");
      sourceRef.current?.classList.remove("is-source-restored");
      sourceRef.current
        ?.querySelector<HTMLElement>(".frame-title")
        ?.classList.remove("is-title-returning");
      stage?.classList.remove("is-inspecting");
      stage?.classList.remove("is-returning");
      document.documentElement.classList.remove("detail-open");
    };
  }, [clearFlightTitle]);

  const titleLines = selected ? splitDisplayTitle(selected.title) : [];
  const isLongTitle = titleLines.length > 1;

  return (
    <section
      ref={runwayRef}
      className="film-runway"
      aria-labelledby="filmstrip-title"
    >
      <div ref={stageRef} className="film-stage">
        <h1 id="filmstrip-title" className="film-sr-only">
          项目胶片 · 横向滚动作品选
        </h1>

        <header className="film-header">
          <span className="film-brand">Portfolio</span>
          <span className="film-header-meta">11 frames · 2026</span>
        </header>

        {/* 左缘铭文：竖排贴在画面最左侧，像胶片边缘的厂标。
            它说明"这是一卷精选作品"，不跟任何一帧绑定，因此不会和卡片文字打架。 */}
        <div className="film-rail" aria-hidden="true">
          <span className="film-rail-label">Selected Works</span>
          <span className="film-rail-rule" />
          <span className="film-rail-meta">
            Vol. 01 · 2026
          </span>
        </div>

        <div ref={viewportRef} className="film-viewport">
          <div className="film-scroller">
            <ul ref={trackRef} className="film-track">
              {LOOP_FRAMES.map(({ project, copy }, index) => (
                <li
                  key={`${project.id}-${copy}-${index}`}
                  className="film-frame"
                  aria-hidden={copy > 0 ? true : undefined}
                >
                  <FrameCard
                    project={project}
                    isOpen={selected?.id === project.id}
                    onOpen={openDetail}
                    isClone={copy > 0}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <TimelineNavigator
          total={PROJECTS.length}
          active={activeIndex}
          onNavigate={(index) => motionControlRef.current?.navigate(index)}
        />

        <p className="film-hint" aria-hidden="true">
          <span className="film-hint-inner" ref={hintRef}>
            [ Scroll to explore ]
          </span>
        </p>
      </div>

      {selected ? (
        <div
          ref={overlayRef}
          className="film-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="film-detail-title"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <div
            ref={backdropRef}
            className="film-detail-backdrop"
            aria-hidden="true"
            style={{ backgroundColor: selected.themeColor }}
            onClick={closeDetail}
          />

          <button
            ref={closeRef}
            type="button"
            className="film-detail-close"
            aria-label="关闭详情"
            onClick={closeDetail}
          >
            <span className="film-detail-close-content btn-shimmer">
              <span className="film-detail-close-hint" aria-hidden="true">
                ESC
              </span>
              <span className="film-detail-close-x" aria-hidden="true">
                ×
              </span>
            </span>
          </button>

          <div className="film-detail-corners" aria-hidden="true">
            <span className="film-detail-corner film-detail-corner-tl">
              Portfolio / 2026
            </span>
            <span className="film-detail-corner film-detail-corner-bl">
              Selected work / {selected.id}
            </span>
            <span className="film-detail-corner film-detail-corner-br">
              Film still / 16:9
            </span>
          </div>

          <div className="film-detail-shell">
            <div
              ref={mediaRef}
              className="film-detail-media"
              role="img"
              aria-label={`《${selected.title}》剧照`}
            >
              <div
                className="film-detail-media-plate"
                ref={plateRef}
                aria-hidden="true"
              >
                <Image
                  className="film-detail-media-img"
                  src={selected.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  unoptimized
                  priority
                />
                <div
                  className="film-detail-media-theme"
                  style={{ backgroundColor: selected.themeColor }}
                />
                <div className="film-detail-media-scrim" />
                <div className="film-detail-media-grain" />
                {/* 跟随指针的径向反光：圆心由 --glare-x/--glare-y 控制。 */}
                <div className="media-glare" aria-hidden="true" />
              </div>
              <span className="film-detail-index" aria-hidden="true">
                {selected.id}
              </span>
              <span className="film-detail-stamp" aria-hidden="true">
                Now inspecting
              </span>
            </div>

              <div
                className="film-detail-media-experience"
                ref={mediaExperienceRef}
              >
                {selected.experienceHref ? (
                  <ExploreTrigger
                    url={selected.experienceHref}
                    label="EXPLORE"
                    metaLeft={selected.meta}
                    metaRight="LIVE DEMO"
                  />
                ) : null}
              </div>

            <div ref={infoRef} className="film-detail-info">
              <p ref={kickerRef} className="film-kicker">
                {selected.kicker}
              </p>
              <h2
                ref={titleRef}
                id="film-detail-title"
                className={`film-detail-title ${
                  isLongTitle ? "is-long" : "is-short"
                }`}
              >
                <span className="film-detail-title-mask">
                  <span
                    ref={titleInnerRef}
                    className="film-detail-title-inner"
                  >
                    {titleLines.map((line, index) => (
                      <span
                        className={`film-detail-title-line${
                          index > 0 ? " is-second" : ""
                        }`}
                        key={`${line}-${index}`}
                      >
                        {line}
                      </span>
                    ))}
                  </span>
                </span>
              </h2>
              <p ref={metaRef} className="film-detail-meta">
                {selected.meta}
              </p>
              <p ref={descriptionRef} className="film-detail-description">
                {selected.description}
              </p>

              <div ref={actionsRef} className="film-detail-actions">
                {selected.externalHref ? (
                  <a
                    className="frame-action frame-action-text"
                    href={selected.externalHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    访问链接
                  </a>
                ) : null}

                <ExploreTrigger
                  label="返回胶片"
                  variant="row"
                  onActivate={closeDetail}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
