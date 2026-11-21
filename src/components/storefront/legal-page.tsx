import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="legal-panel rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="font-display text-4xl text-espresso">{title}</h1>
        <div className="mt-8 space-y-4 text-base leading-7 text-espresso">
          {children}
        </div>
      </div>
    </article>
  );
}
