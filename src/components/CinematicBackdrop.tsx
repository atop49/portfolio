"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A deliberately quiet, purely decorative film-viewer layer.
 *
 * Nothing here receives pointer events, and every moving piece is limited to
 * transform/opacity. The film strip lives above this layer (z-index: 1 on
 * .film-runway), so it keeps the foreground focus.
 */

/** GSAP stand-in for the reference spring (stiffness 50 / damping 20). */
const ROLL_EASE = "back.out(1.7)";
const ROLL_DURATION = 0.5;

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0");
}

export default function CinematicBackdrop() {
  const reticleRef = useRef<HTMLDivElement>(null);
  const rulerTrackRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const reelTiltRef = useRef<HTMLDivElement>(null);
  const reelSpinRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const millisRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reticle = reticleRef.current;
    const rulerTrack = rulerTrackRef.current;
    const reel = reelRef.current;
    const reelTilt = reelTiltRef.current;
    const reelSpin = reelSpinRef.current;
    if (!reticle || !rulerTrack || !reel || !reelTilt || !reelSpin) return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let reticleTween: gsap.core.Tween | null = null;
    let rulerTween: gsap.core.Tween | null = null;
    let reelSpinTween: gsap.core.Tween | null = null;
    let reelTiltTween: gsap.core.Tween | null = null;
    let reelFadeTween: gsap.core.Tween | null = null;
    let timecodeRaf: number | null = null;
    let reelVisible = !document.documentElement.classList.contains("detail-open");

    const rollsRef = {
      h: { value: 0, el: hoursRef.current },
      m: { value: 0, el: minutesRef.current },
      s: { value: 0, el: secondsRef.current },
    };

    const writeTimecode = () => {
      const now = new Date();
      if (millisRef.current) {
        millisRef.current.textContent = pad(now.getMilliseconds(), 3);
      }
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const tick = (roll: { value: number; el: HTMLSpanElement | null }, next: number) => {
        if (next === roll.value || !roll.el) return;
        roll.value = next;
        roll.el.textContent = pad(next);
        gsap.fromTo(
          roll.el,
          { yPercent: -60, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: ROLL_DURATION,
            ease: ROLL_EASE,
            overwrite: true,
          },
        );
      };
      tick(rollsRef.h, h);
      tick(rollsRef.m, m);
      tick(rollsRef.s, s);
    };

    const startTimecode = () => {
      writeTimecode();
      timecodeRaf = requestAnimationFrame(function loop() {
        writeTimecode();
        timecodeRaf = requestAnimationFrame(loop);
      });
    };

    const stopTimecode = () => {
      if (timecodeRaf !== null) {
        cancelAnimationFrame(timecodeRaf);
        timecodeRaf = null;
      }
      Object.values(rollsRef).forEach((roll) => {
        if (roll.el) gsap.killTweensOf(roll.el);
      });
    };

    const stop = () => {
      stopTimecode();
      reticleTween?.kill();
      rulerTween?.kill();
      reelSpinTween?.kill();
      reelTiltTween?.kill();
      reelFadeTween?.kill();
      reticleTween = null;
      rulerTween = null;
      reelSpinTween = null;
      reelTiltTween = null;
      reelFadeTween = null;
      gsap.set(reticle, { clearProps: "transform,opacity" });
      gsap.set(rulerTrack, { clearProps: "transform" });
      gsap.set(reelTilt, { rotationX: 25, rotationY: -15 });
      gsap.set(reelSpin, { rotation: 0 });
    };

    const start = () => {
      stop();

      if (motionQuery.matches) {
        // No rolling under reduced motion, but the readout should still
        // show the real wall-clock time as a static value.
        const now = new Date();
        if (hoursRef.current) hoursRef.current.textContent = pad(now.getHours());
        if (minutesRef.current) minutesRef.current.textContent = pad(now.getMinutes());
        if (secondsRef.current) secondsRef.current.textContent = pad(now.getSeconds());
        if (millisRef.current) millisRef.current.textContent = pad(now.getMilliseconds(), 3);
        reelSpinTween?.pause();
        reelTiltTween?.pause();
        return;
      }

      // Wall-clock timecode: the millisecond field runs continuously with
      // rAF, while h/m/s roll with a spring only when their value changes.
      startTimecode();

      reticleTween = gsap.to(reticle, {
        scale: 1.02,
        opacity: 0.06,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      rulerTween = gsap.to(rulerTrack, {
        x: -40,
        duration: 2,
        ease: "none",
        repeat: -1,
      });

      reelSpinTween = gsap.to(reelSpin, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1,
      });

      reelTiltTween = gsap.to(reelTilt, {
        rotationX: 30,
        rotationY: -20,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    };

    // Keep the reel's state in sync with the inspection overlay without
    // changing the surrounding page layout. Fading is also the signal to
    // pause its two infinite loops while they cannot be seen.
    const syncReel = () => {
      const open = document.documentElement.classList.contains("detail-open");
      if (open === !reelVisible) return;
      reelVisible = !open;
      reelFadeTween?.kill();
      reelFadeTween = gsap.to(reel, {
        opacity: reelVisible ? 0.12 : 0,
        duration: 0.45,
        ease: "power2.out",
      });

      if (reelVisible && !motionQuery.matches) {
        reelSpinTween?.play();
        reelTiltTween?.play();
      } else {
        reelSpinTween?.pause();
        reelTiltTween?.pause();
      }
    };

    const reelObserver = new MutationObserver(syncReel);
    reelObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    start();
    motionQuery.addEventListener("change", start);

    return () => {
      motionQuery.removeEventListener("change", start);
      reelObserver.disconnect();
      stop();
    };
  }, []);

  return (
    <div className="cine-backdrop" aria-hidden="true">
      <div className="cine-reel" ref={reelRef}>
        <div className="cine-reel-tilt" ref={reelTiltRef}>
          <div className="cine-reel-spin" ref={reelSpinRef}>
            <svg
              className="cine-reel-svg"
              viewBox="0 0 600 600"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="reel-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#b8b8b8" />
                  <stop offset="0.3" stopColor="#7a7a7a" />
                  <stop offset="0.62" stopColor="#4a4a4a" />
                  <stop offset="1" stopColor="#a0a0a0" />
                </linearGradient>
                <linearGradient id="reel-rim" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0" stopColor="#c9c9c9" />
                  <stop offset="0.45" stopColor="#666666" />
                  <stop offset="1" stopColor="#9e9e9e" />
                </linearGradient>
                <radialGradient id="reel-hub" cx="35%" cy="28%" r="75%">
                  <stop offset="0" stopColor="#b4b4b4" />
                  <stop offset="0.5" stopColor="#777777" />
                  <stop offset="1" stopColor="#3d3d3d" />
                </radialGradient>
                <filter id="reel-inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feOffset dx="2" dy="3" />
                  <feGaussianBlur stdDeviation="3" result="offset-blur" />
                  <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                  <feFlood floodColor="#000000" floodOpacity="0.75" result="color" />
                  <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                  <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                </filter>
                <path
                  id="reel-window"
                  d="M 284 142 A 162 162 0 0 1 423 220 L 350 267 A 58 58 0 0 0 301 242 Z"
                />
                <mask id="reel-cutouts">
                  <rect width="600" height="600" fill="white" />
                  <use href="#reel-window" fill="black" />
                  <use href="#reel-window" fill="black" transform="rotate(72 300 300)" />
                  <use href="#reel-window" fill="black" transform="rotate(144 300 300)" />
                  <use href="#reel-window" fill="black" transform="rotate(216 300 300)" />
                  <use href="#reel-window" fill="black" transform="rotate(288 300 300)" />
                  <circle cx="300" cy="300" r="27" fill="black" />
                  <circle cx="300" cy="50" r="6" fill="black" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(30 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(60 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(90 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(120 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(150 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(180 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(210 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(240 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(270 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(300 300 300)" />
                  <circle cx="300" cy="50" r="6" fill="black" transform="rotate(330 300 300)" />
                </mask>
                <linearGradient id="reel-sheen" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="0.48" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="0.56" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="0.64" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g mask="url(#reel-cutouts)">
                <circle cx="300" cy="300" r="278" fill="url(#reel-metal)" filter="url(#reel-inner-shadow)" />
                <circle cx="300" cy="300" r="273" fill="none" stroke="url(#reel-rim)" strokeWidth="10" />
                <circle cx="300" cy="300" r="263" fill="none" stroke="#c0c0c0" strokeOpacity="0.5" strokeWidth="2" />
                <circle cx="300" cy="300" r="251" fill="none" stroke="#1a1a1a" strokeOpacity="0.75" strokeWidth="3" />
                <circle cx="300" cy="300" r="92" fill="url(#reel-hub)" />
                <circle cx="300" cy="300" r="83" fill="none" stroke="#b0b0b0" strokeOpacity="0.6" strokeWidth="2" />
                <circle cx="300" cy="300" r="41" fill="url(#reel-rim)" />
                <circle cx="300" cy="300" r="34" fill="none" stroke="#b0b0b0" strokeOpacity="0.65" strokeWidth="2" />
                <circle cx="300" cy="300" r="276" fill="url(#reel-sheen)" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="cine-timecode-stack">
        <span className="cine-timecode-label">REC</span>
        <span className="cine-timecode" role="timer">
          <span className="cine-timecode-field" ref={hoursRef}>
            00
          </span>
          <span className="cine-timecode-sep">:</span>
          <span className="cine-timecode-field" ref={minutesRef}>
            00
          </span>
          <span className="cine-timecode-sep">:</span>
          <span className="cine-timecode-field" ref={secondsRef}>
            00
          </span>
          <span className="cine-timecode-sep">.</span>
          <span className="cine-timecode-field is-millis" ref={millisRef}>
            000
          </span>
        </span>
      </div>

      <div className="cine-reticle" ref={reticleRef}>
        <span className="cine-reticle-corner cine-reticle-tl" />
        <span className="cine-reticle-corner cine-reticle-tr" />
        <span className="cine-reticle-corner cine-reticle-bl" />
        <span className="cine-reticle-corner cine-reticle-br" />
        <span className="cine-reticle-cross" />
      </div>

      <div className="cine-ruler">
        <div className="cine-ruler-track" ref={rulerTrackRef} />
      </div>
    </div>
  );
}
