"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import CinematicBackdrop from "./CinematicBackdrop";
import FilmStrip from "./film-strip";
import SkillsCredits from "./SkillsCredits";
import AboutTitlePage from "./AboutTitlePage";

type View = "projects" | "skills" | "about";

type Theme = {
  bg: string;
  text: string;
  secondary: string;
};

const FILM_EASE = "filmEase";

const PROJECT_THEME: Theme = {
  bg: "#111111",
  text: "#F5F1E8",
  secondary: "#8C877D",
};

const SKILLS_THEME: Theme = {
  bg: "#F5F1E8",
  text: "#111111",
  secondary: "#4A4A4A",
};

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : value;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l] as const;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s, l] as const;
}

function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * 检片台墨色跟随台面：亮底取同一色相压深成深墨，
 * 暗底（如剪辑台的近黑）则翻成同一色相的暖纸白。
 */
function deriveInkTheme(bg: string): Theme {
  const rgb = hexToRgb(bg);
  const [h, s] = rgbToHsl(rgb);
  if (relativeLuminance(rgb) < 0.4) {
    return {
      bg,
      text: hslToHex(h, Math.min(s * 0.6, 0.18), 0.92),
      secondary: hslToHex(h, Math.min(s * 0.5, 0.15), 0.62),
    };
  }
  return {
    bg,
    text: hslToHex(h, Math.min(s * 1.4 + 0.08, 0.45), 0.15),
    secondary: hslToHex(h, Math.min(s + 0.05, 0.3), 0.36),
  };
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  if (!CustomEase.get(FILM_EASE)) {
    CustomEase.create(FILM_EASE, "M0,0 C0.22,1 0.36,1 1,1");
  }
}

function readVar(root: HTMLElement, name: string, fallback: string) {
  const inline = root.style.getPropertyValue(name).trim();
  if (inline) return inline;
  const computed = getComputedStyle(root).getPropertyValue(name).trim();
  return computed || fallback;
}

export default function SiteShell() {
  const [view, setView] = useState<View>("projects");
  const [inspectTheme, setInspectTheme] = useState<string | null>(null);
  const themeTweenRef = useRef<gsap.core.Tween | null>(null);

  const handleThemeChange = useCallback((themeColor: string | null) => {
    setInspectTheme(themeColor);
  }, []);

  const goTo = useCallback(
    (next: View) => {
      if (next === view) return;
      window.scrollTo(0, 0);
      setInspectTheme(null);
      setView(next);
    },
    [view],
  );

  useEffect(() => {
    const root = document.documentElement;
    const target: Theme =
      view === "skills"
        ? SKILLS_THEME
        : inspectTheme
          ? deriveInkTheme(inspectTheme)
          : PROJECT_THEME;
    const state = {
      bg: readVar(root, "--bg-primary", PROJECT_THEME.bg),
      text: readVar(root, "--text-primary", PROJECT_THEME.text),
      secondary: readVar(root, "--text-secondary", PROJECT_THEME.secondary),
    };

    themeTweenRef.current?.kill();
    root.classList.add("theme-is-animating");
    root.classList.toggle("skills-open", view === "skills");
    // 台面明暗标记：亮色台面下相纸投影要更重，才压得住背景。
    root.dataset.surfaceTone =
      relativeLuminance(hexToRgb(target.bg)) >= 0.4 ? "light" : "dark";

    const tween = gsap.to(state, {
      bg: target.bg,
      text: target.text,
      secondary: target.secondary,
      duration: 0.8,
      ease: FILM_EASE,
      overwrite: true,
      onUpdate: () => {
        root.style.setProperty("--bg-primary", state.bg);
        root.style.setProperty("--text-primary", state.text);
        root.style.setProperty("--text-secondary", state.secondary);
      },
      onComplete: () => {
        root.classList.remove("theme-is-animating");
      },
      onInterrupt: () => {
        root.classList.remove("theme-is-animating");
      },
    });

    themeTweenRef.current = tween;

    return () => {
      tween.kill();
      root.classList.remove("theme-is-animating");
    };
  }, [inspectTheme, view]);

  return (
    <>
      <nav className="site-nav" aria-label="主导航">
        <button
          type="button"
          onClick={() => goTo("projects")}
          aria-current={view === "projects" ? "page" : undefined}
        >
          Projects
        </button>
        <span className="site-nav-separator" aria-hidden="true">
          /
        </span>
        <button
          type="button"
          onClick={() => goTo("skills")}
          aria-current={view === "skills" ? "page" : undefined}
        >
          Skills
        </button>
        <span className="site-nav-separator" aria-hidden="true">
          /
        </span>
        <button
          type="button"
          onClick={() => goTo("about")}
          aria-current={view === "about" ? "page" : undefined}
        >
          About
        </button>
      </nav>

      {view === "projects" && (
        <>
          <CinematicBackdrop />
          <FilmStrip onThemeChange={handleThemeChange} />
        </>
      )}
      {view === "skills" && <SkillsCredits />}
      {view === "about" && <AboutTitlePage />}
    </>
  );
}
