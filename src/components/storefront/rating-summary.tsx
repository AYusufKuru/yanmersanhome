"use client";

import type { MouseEvent } from "react";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 1.6 12.4 7l5.8.5-4.4 3.8 1.4 5.6L10 14.2 4.8 17l1.4-5.6L1.8 7.5 7.6 7 10 1.6Z"
      />
    </svg>
  );
}

export function StarMark({
  fill,
  size = "sm",
}: {
  fill: number;
  size?: "sm" | "md";
}) {
  const box = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  const amount = Math.min(1, Math.max(0, fill));
  return (
    <span className={`relative inline-block ${box}`} aria-hidden="true">
      <StarIcon className={`${box} text-espresso/15`} />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${amount * 100}%` }}
      >
        <StarIcon className={`${box} text-warning`} />
      </span>
    </span>
  );
}

export function StarRow({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <StarMark key={index} fill={value - index} size={size} />
      ))}
    </span>
  );
}

function scrollToSection(
  event: MouseEvent<HTMLAnchorElement>,
  id: string,
) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  event.preventDefault();
  history.pushState(null, "", `#${id}`);
  window.dispatchEvent(new Event("hashchange"));
  const card = document.getElementById("urun-kart") ?? target;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
}

export function formatRating(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function RatingSummary({
  ratingAverage,
  reviewCount,
  questionCount,
  linked = false,
  size = "sm",
}: {
  ratingAverage: number | null;
  reviewCount: number;
  questionCount: number;
  linked?: boolean;
  size?: "sm" | "md";
}) {
  const score =
    ratingAverage !== null && reviewCount > 0
      ? formatRating(ratingAverage)
      : null;
  const reviewLabel = `${reviewCount} Değerlendirme`;
  const questionLabel = `${questionCount} Soru-Cevap`;
  const text = size === "md" ? "text-sm" : "text-xs sm:text-sm";

  return (
    <p
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${text} text-espresso/70`}
    >
      <span className="sr-only">
        {score
          ? `${score} üzerinden 5, ${reviewLabel}. ${questionLabel}.`
          : `Henüz değerlendirme yok. ${questionLabel}.`}
      </span>
      {score ? (
        <span className="font-medium text-espresso" aria-hidden="true">
          {score}
        </span>
      ) : null}
      <StarRow value={score ? (ratingAverage ?? 0) : 0} size={size} />
      {linked ? (
        <a
          href="#degerlendirmeler"
          className="hover:text-espresso"
          aria-hidden="true"
          onClick={(event) => scrollToSection(event, "degerlendirmeler")}
        >
          {reviewLabel}
        </a>
      ) : (
        <span aria-hidden="true">{reviewLabel}</span>
      )}
      <span aria-hidden="true">·</span>
      {linked ? (
        <a
          href="#soru-cevap"
          className="hover:text-espresso"
          aria-hidden="true"
          onClick={(event) => scrollToSection(event, "soru-cevap")}
        >
          {questionLabel}
        </a>
      ) : (
        <span aria-hidden="true">{questionLabel}</span>
      )}
    </p>
  );
}
