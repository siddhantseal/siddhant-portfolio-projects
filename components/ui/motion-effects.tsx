"use client";

import { useEffect, useRef } from "react";

export function MotionEffects() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (reducedMotion) return;

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("isVisible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 260)}ms`);
      observer.observe(item);
    });

    if (!finePointer) {
      return () => observer.disconnect();
    }

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let currentX = cursorX;
    let currentY = cursorY;
    let animationFrame = 0;

    const moveCursor = (event: PointerEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      document.documentElement.classList.add("hasMotionCursor");
      dotRef.current?.style.setProperty("--cursor-x", `${cursorX}px`);
      dotRef.current?.style.setProperty("--cursor-y", `${cursorY}px`);
    };

    const animateCursor = () => {
      currentX += (cursorX - currentX) * 0.2;
      currentY += (cursorY - currentY) * 0.2;
      cursorRef.current?.style.setProperty("--cursor-x", `${currentX}px`);
      cursorRef.current?.style.setProperty("--cursor-y", `${currentY}px`);
      animationFrame = requestAnimationFrame(animateCursor);
    };

    const setCursorActive = () => document.documentElement.classList.add("cursorActive");
    const unsetCursorActive = () => document.documentElement.classList.remove("cursorActive");

    document.addEventListener("pointermove", moveCursor);
    document.addEventListener("pointerdown", setCursorActive);
    document.addEventListener("pointerup", unsetCursorActive);
    animationFrame = requestAnimationFrame(animateCursor);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointermove", moveCursor);
      document.removeEventListener("pointerdown", setCursorActive);
      document.removeEventListener("pointerup", unsetCursorActive);
      cancelAnimationFrame(animationFrame);
      document.documentElement.classList.remove("hasMotionCursor", "cursorActive");
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="motionCursor" aria-hidden="true" />
      <div ref={dotRef} className="motionCursorDot" aria-hidden="true" />
    </>
  );
}
