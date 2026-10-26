"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CollectionItem = {
  id: string;
  image: string;
  title: string;
  category?: string;
  price?: number;
  href?: string;
};

type CollectionSurferProps = {
  items: CollectionItem[];
  variant?: "magnetic" | "uplift" | "simple";
};

export function CollectionSurfer({ items, variant = "uplift" }: CollectionSurferProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const visibleItems = useMemo(() => items.slice(0, 7), [items]);
  const activeIndex = Math.round(progress * Math.max(visibleItems.length - 1, 1));

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const start = window.innerHeight * 0.82;
      const end = -rect.height * 0.24;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className={`collectionSurferSection ${variant}`} ref={sectionRef} data-scroll-reveal>
      <div className="collectionSurferCopy">
        <p className="eyebrow">Trending collections</p>
        <h2>Surf through popular picks before you open the shop.</h2>
        <p>
          Explore real product cards from mobiles, fashion, home, beauty, sports, and electronics
          in a smooth storefront-style track.
        </p>
      </div>
      <div className="collectionSurferStage" style={{ "--surfer-progress": progress } as CSSProperties}>
        <div className="collectionSurferRail" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.06, progress)})` }} />
        </div>
        <div className="collectionSurferTrack" aria-label="Featured product collection">
          {visibleItems.map((item, index) => {
            const position = index - progress * Math.max(visibleItems.length - 1, 1);
            const distance = Math.abs(position);
            const direction = position < 0 ? -1 : 1;
            const x = position * 176;
            const y = variant === "uplift" ? -Math.max(0, 34 - distance * 18) : 0;
            const z = -distance * 92;
            const rotate = position * -12;
            const scale = Math.max(0.72, 1 - distance * 0.08);
            const opacity = Math.max(0.36, 1 - distance * 0.16);
            const blur = Math.min(2.4, distance * 0.55);
            const layer = Math.round(100 - distance * 10);
            return (
              <Link
                className={`collectionSurferCard ${index === activeIndex ? "active" : ""}`}
                href={item.href ?? "/commerce"}
                key={item.id}
                style={
                  {
                    "--surfer-index": index,
                    "--surfer-x": `${x}px`,
                    "--surfer-y": `${y}px`,
                    "--surfer-z": `${z}px`,
                    "--surfer-rotate": `${rotate}deg`,
                    "--surfer-scale": scale,
                    "--surfer-opacity": opacity,
                    "--surfer-blur": `${blur}px`,
                    "--surfer-layer": layer,
                    "--surfer-direction": direction
                  } as CSSProperties
                }
              >
                <img alt={item.title} src={item.image} />
                {item.category ? <span>{item.category}</span> : null}
                <strong>{item.title}</strong>
                {typeof item.price === "number" ? <small>Rs {item.price.toLocaleString("en-IN")}</small> : null}
              </Link>
            );
          })}
        </div>
        <div className="collectionSurferCaption" aria-live="polite">
          <span>{visibleItems[activeIndex]?.category ?? "Featured"}</span>
          <strong>{visibleItems[activeIndex]?.title}</strong>
        </div>
      </div>
    </section>
  );
}
