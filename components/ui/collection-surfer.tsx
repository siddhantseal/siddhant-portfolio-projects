"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CollectionSurferItem = {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
  href: string;
};

type CollectionSurferProps = {
  items: CollectionSurferItem[];
};

export function CollectionSurfer({ items }: CollectionSurferProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const visibleItems = useMemo(() => items.slice(0, 5), [items]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = window.innerHeight + rect.height;
      const raw = (window.innerHeight - rect.top) / distance;
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
    <section className="collectionSurferSection" ref={sectionRef} data-scroll-reveal>
      <div className="collectionSurferCopy">
        <p className="eyebrow">Trending collections</p>
        <h2>Surf through popular picks before you open the shop.</h2>
        <p>
          Explore real product cards from mobiles, fashion, home, beauty, sports, and electronics
          in a smooth storefront-style track.
        </p>
      </div>
      <div className="collectionSurferStage" style={{ "--surfer-progress": progress } as CSSProperties}>
        <div className="collectionSurferTrack" aria-label="Featured product collection">
          {visibleItems.map((item, index) => {
            const offset = index - (visibleItems.length - 1) / 2;
            const depth = Math.abs(offset);
            const x = offset * 142;
            const z = depth * -48;
            const rotate = offset * -6;
            const layer = Math.round(100 - depth * 10);
            return (
              <Link
                className="collectionSurferCard"
                href={item.href}
                key={item.id}
                style={
                  {
                    "--surfer-index": index,
                    "--surfer-x": `${x}px`,
                    "--surfer-z": `${z}px`,
                    "--surfer-rotate": `${rotate}deg`,
                    "--surfer-layer": layer
                  } as CSSProperties
                }
              >
                <img alt={item.title} src={item.image} />
                <span>{item.category}</span>
                <strong>{item.title}</strong>
                <small>Rs {item.price.toLocaleString("en-IN")}</small>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
