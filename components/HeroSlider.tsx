"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

type Slide = {
  id: string;
  image: string;
  title: string;
  desc?: string;
  cta?: string;
  href?: string;
};

export default function HeroSlider({
  slides,
  intervalMs = 3500,
  showProgress = true,
}: {
  slides: Slide[];
  intervalMs?: number;
  showProgress?: boolean;
}) {
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // progress 0..1
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // swipe tracking
  const startXRef = useRef<number | null>(null);
  const lastXRef = useRef<number | null>(null);

  const go = (nextIdx: number) => {
    if (!safeSlides.length) return;
    setPrevIdx(idx);
    setIdx((nextIdx + safeSlides.length) % safeSlides.length);
    setProgress(0);
    startRef.current = performance.now();
  };

  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  // auto slide + progress
  useEffect(() => {
    if (safeSlides.length <= 1) return;
    if (isDragging) return;

    startRef.current = performance.now();
    setProgress(0);

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - startRef.current) / intervalMs);
      setProgress(t);

      if (t >= 1) {
        // gunakan setIdx fungsional biar gak kena stale idx
        setPrevIdx((p) => (p === null ? idx : p));
        setIdx((cur) => {
          const nextI = (cur + 1) % safeSlides.length;
          setPrevIdx(cur);
          return nextI;
        });
        startRef.current = performance.now();
        setProgress(0);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, safeSlides.length, intervalMs, isDragging]);

  // clear prev after fade duration
  useEffect(() => {
    if (prevIdx == null) return;
    const t = setTimeout(() => setPrevIdx(null), 520);
    return () => clearTimeout(t);
  }, [prevIdx]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    lastXRef.current = e.clientX;
  };

  const onPointerUp = () => {
    const startX = startXRef.current;
    const lastX = lastXRef.current;

    setIsDragging(false);
    startXRef.current = null;
    lastXRef.current = null;

    if (startX == null || lastX == null) return;

    const dx = lastX - startX;
    const threshold = 45;
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
  };

  const active = safeSlides[idx];
  const previous = prevIdx != null ? safeSlides[prevIdx] : null;
  if (!active) return null;

  const Wrapper = active.href ? Link : ("div" as any);
  const wrapperProps = active.href
    ? { href: active.href, className: "block" }
    : { className: "block" };

  return (
    <Wrapper {...wrapperProps}>
      <div className="relative overflow-hidden rounded-3xl border border-[#EEF0F6] bg-white">
        <div
          className="relative h-[180px] sm:h-[260px] touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Previous (fade out) */}
          {previous ? (
            <div className="absolute inset-0 opacity-100 animate-[fadeOut_.52s_ease_forwards]">
              <Image
                src={previous.image}
                alt={previous.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
            </div>
          ) : null}

          {/* Current (fade in) */}
          <div
            key={active.id}
            className="absolute inset-0 opacity-0 animate-[fadeIn_.52s_ease_forwards]"
          >
            <Image
              src={active.image}
              alt={active.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

          {/* content */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 sm:left-8">
            <p className="text-xs font-semibold text-white/90">E-COMMERCE</p>
            <h1 className="mt-1 max-w-[22ch] text-2xl font-bold tracking-tight text-white sm:text-4xl">
              {active.title}
            </h1>
            {active.desc ? (
              <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
                {active.desc}
              </p>
            ) : null}

            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#111827] shadow-sm">
              {active.cta ?? "Login untuk berbelanja"}
              <span aria-hidden className="text-[#9CA3AF]">
                →
              </span>
            </div>
          </div>

          {/* arrows */}
          {safeSlides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prev();
                }}
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2",
                  "grid h-10 w-10 place-items-center rounded-2xl",
                  "border border-[#EEF0F6] bg-white/90 shadow-sm backdrop-blur",
                  "hover:bg-white transition"
                )}
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Next slide"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  next();
                }}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "grid h-10 w-10 place-items-center rounded-2xl",
                  "border border-[#EEF0F6] bg-white/90 shadow-sm backdrop-blur",
                  "hover:bg-white transition"
                )}
              >
                →
              </button>
            </>
          ) : null}

          {/* dots */}
          {safeSlides.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {safeSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    go(i);
                  }}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    i === idx ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          ) : null}

          {/* progress */}
          {showProgress && safeSlides.length > 1 ? (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
              <div
                className="h-full bg-white/90"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          ) : null}
        </div>

        {/* keyframes local (biar gak perlu edit global css) */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </Wrapper>
  );
}
