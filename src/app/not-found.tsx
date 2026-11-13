import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start px-5 py-20">
      <h1 className="font-display text-4xl text-espresso">Sayfa bulunamadı</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Aradığınız sayfa yok. Vitrinden devam edebilirsiniz.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
      >
        Ana sayfa
      </Link>
    </section>
  );
}
