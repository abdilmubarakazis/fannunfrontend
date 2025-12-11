"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { cn } from "@/components/ui/cn";

function useSwipe(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);
  const [drag, setDrag] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    setDrag(true);
    startX.current = e.clientX;
    lastX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    lastX.current = e.clientX;
  };

  const onPointerUp = () => {
    const a = startX.current;
    const b = lastX.current;

    setDrag(false);
    startX.current = null;
    lastX.current = null;

    if (a == null || b == null) return;
    const dx = b - a;
    const threshold = 45;
    if (dx > threshold) onPrev();
    else if (dx < -threshold) onNext();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
}

export default function ProductGallery({
  images,
  alt,
}: {
  images: (string | null | undefined)[];
  alt: string;
}) {
  const list = useMemo(
    () =>
      images.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0
      ),
    [images]
  );

  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);

  const next = () => setI((v) => (v + 1) % list.length);
  const prev = () => setI((v) => (v - 1 + list.length) % list.length);

  const swipeMain = useSwipe(prev, next);
  const swipeModal = useSwipe(prev, next);

  if (list.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border bg-gray-50 text-sm text-gray-500">
        No Image
      </div>
    );
  }

  const active = list[i];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl border bg-gray-50">
        <div
          className="relative aspect-[4/3] touch-pan-y select-none"
          {...swipeMain}
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setOpen(true)}
            aria-label="Open image viewer"
          />

          <Image
            src={active}
            alt={alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* arrows */}
          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border bg-white/80 backdrop-blur hover:bg-white"
                aria-label="Prev image"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border bg-white/80 backdrop-blur hover:bg-white"
                aria-label="Next image"
              >
                →
              </button>
            </>
          ) : null}

          {/* counter */}
          {list.length > 1 ? (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2 py-1 text-xs font-medium text-white">
              {i + 1}/{list.length}
            </div>
          ) : null}
        </div>
      </div>

      {/* thumbnails */}
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setI(idx)}
              className={cn(
                "relative h-16 w-16 flex-none overflow-hidden rounded-xl border bg-gray-50",
                idx === i
                  ? "ring-2 ring-black/60"
                  : "hover:ring-2 hover:ring-black/20"
              )}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Fullscreen viewer */}
      <Modal open={open} onClose={() => setOpen(false)} title={alt}>
        <div className="space-y-3">
          <div
            className="relative overflow-hidden rounded-2xl border bg-black"
            {...swipeModal}
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/9]">
              <Image
                src={active}
                alt={alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 92vw, 1000px"
              />
            </div>

            {list.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border bg-white/85 backdrop-blur hover:bg-white"
                  aria-label="Prev image"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border bg-white/85 backdrop-blur hover:bg-white"
                  aria-label="Next image"
                >
                  →
                </button>

                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-black">
                  {i + 1}/{list.length}
                </div>
              </>
            ) : null}
          </div>

          {list.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {list.map((src, idx) => (
                <button
                  key={`modal-${src}-${idx}`}
                  type="button"
                  onClick={() => setI(idx)}
                  className={cn(
                    "relative h-16 w-16 flex-none overflow-hidden rounded-xl border bg-gray-50",
                    idx === i
                      ? "ring-2 ring-black/70"
                      : "hover:ring-2 hover:ring-black/20"
                  )}
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${alt} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-gray-600">
            Tips: swipe kiri/kanan untuk ganti foto.
          </p>
        </div>
      </Modal>
    </div>
  );
}
