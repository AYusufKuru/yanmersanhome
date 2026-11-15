"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ProductPhoto = {
  url: string;
  alt: string;
};

export function ProductPhotos({
  images,
  fallbackAlt,
}: {
  images: ProductPhoto[];
  fallbackAlt: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frames = images.filter((image) => image.url);
  const current = Math.min(index, Math.max(frames.length - 1, 0));

  useEffect(() => {
    if (!playing || frames.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((frame) => (frame + 1) % frames.length);
    }, 1500);

    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  function onEnter() {
    if (frames.length < 2) {
      return;
    }
    setIndex(1);
    setPlaying(true);
  }

  function onLeave() {
    setPlaying(false);
    setIndex(0);
  }

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {frames.map((image, frame) => (
        <Image
          key={`${image.url}-${frame}`}
          src={image.url}
          alt={frame === current ? image.alt || fallbackAlt : ""}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          aria-hidden={frame === current ? undefined : true}
          className={`object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
            frame === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
