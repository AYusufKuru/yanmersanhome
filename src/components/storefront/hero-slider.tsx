"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";
import type { HeroSlide } from "@/data/sample-catalog";

type HeroSliderProps = {
  slides: HeroSlide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || motion.matches || count < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, count]);

  function go(next: number) {
    setIndex((next + count) % count);
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const target = event.target;
    if (target instanceof Element && target.closest("a, button")) {
      return;
    }
    const start = Number(event.currentTarget.dataset.x ?? "0");
    const delta = event.clientX - start;
    if (delta > 48) {
      go(index - 1);
    } else if (delta < -48) {
      go(index + 1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkan bölümler"
      className="relative h-[32rem] overflow-hidden bg-espresso sm:h-[36rem] lg:h-[40rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(event: PointerEvent<HTMLElement>) => {
        event.currentTarget.dataset.x = String(event.clientX);
      }}
      onPointerUp={onPointerUp}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.category}
          aria-hidden={slideIndex !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            slideIndex === index
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            priority={slideIndex === 0}
            loading={slideIndex === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/25 to-espresso/10" />
          <div className="relative flex h-full items-end px-5 pb-24 sm:px-8 lg:px-16">
            <div className="max-w-xl text-background">
              <p className="text-xs tracking-[0.22em] text-cream uppercase">
                {slide.eyebrow}
              </p>
              <h1 className="font-display mt-3 text-4xl leading-tight sm:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-cream">
                {slide.text}
              </p>
              <Link
                href={`/kategori/${slide.category}`}
                className="mt-6 inline-flex h-12 items-center rounded-full bg-background px-6 text-sm text-espresso"
              >
                Bölümü gör
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-2 sm:px-4">
        <button
          type="button"
          aria-label="Önceki slayt"
          onClick={() => go(index - 1)}
          className="grid h-11 w-11 place-items-center rounded-full bg-background/85 text-xl text-espresso"
        >
          ‹
        </button>
        <div className="flex items-center">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.category}
              type="button"
              aria-label={`${slide.eyebrow} slaydı`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => go(slideIndex)}
              className="grid h-11 w-8 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full ${
                  slideIndex === index
                    ? "w-6 bg-background"
                    : "w-3 bg-background/50"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Sonraki slayt"
          onClick={() => go(index + 1)}
          className="grid h-11 w-11 place-items-center rounded-full bg-background/85 text-xl text-espresso"
        >
          ›
        </button>
      </div>
    </section>
  );
}
