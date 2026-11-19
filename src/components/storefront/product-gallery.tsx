"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const frames = images.filter((image) => image.url);
  const [index, setIndex] = useState(0);
  const current = frames[Math.min(index, Math.max(frames.length - 1, 0))];

  if (!current) {
    return <div className="aspect-[4/3] w-full max-w-xl rounded-3xl bg-cream" />;
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="object-cover"
        />
      </div>
      {frames.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {frames.map((image, frame) => {
            const selected = frame === index;
            return (
              <li key={`${image.url}-${frame}`}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${name}, görsel ${frame + 1}`}
                  onClick={() => setIndex(frame)}
                  className={`group relative h-16 w-16 overflow-hidden rounded-2xl bg-cream ${
                    selected
                      ? "ring-2 ring-coffee ring-offset-2 ring-offset-card"
                      : ""
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="64px"
                    className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
                      selected
                        ? "opacity-100"
                        : "opacity-40 group-hover:opacity-100"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
