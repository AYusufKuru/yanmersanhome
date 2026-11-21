export function PaymentMarks({ tone = "light" }: { tone?: "light" | "dark" }) {
  const band = (
    <a
      href="https://www.iyzico.com"
      target="_blank"
      rel="noopener noreferrer"
      className={
        tone === "dark"
          ? "inline-flex rounded-xl bg-card px-3 py-2"
          : "inline-flex"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/payments/logo-band-colored.svg"
        alt="iyzico ile Öde, Visa ve Mastercard"
        className="h-8 w-auto"
      />
    </a>
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      {tone === "light" ? (
        <a
          href="https://www.iyzico.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/payments/iyzico-ile-ode.svg"
            alt="iyzico ile Öde"
            className="h-12 w-auto"
          />
        </a>
      ) : null}
      {band}
    </div>
  );
}
