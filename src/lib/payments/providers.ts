export type PaymentProviderName = "mock" | "iyzico" | "paytr";

export function activeProvider(): PaymentProviderName {
  const value = process.env.PAYMENT_PROVIDER;
  if (value === "iyzico" || value === "paytr") {
    return value;
  }
  return "mock";
}

export function iyzicoCharge() {
  const hasKey = Boolean(
    process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY,
  );
  if (!hasKey) {
    return {
      ok: false as const,
      error: "iyzico anahtarı yok. Canlı çekim kapalı.",
    };
  }
  return {
    ok: false as const,
    error: "iyzico imza doğrulaması bağlı değil. Canlı çekim kapalı.",
  };
}

export function paytrCharge() {
  const hasKey = Boolean(
    process.env.PAYTR_MERCHANT_ID &&
    process.env.PAYTR_MERCHANT_KEY &&
    process.env.PAYTR_MERCHANT_SALT,
  );
  if (!hasKey) {
    return {
      ok: false as const,
      error: "PayTR anahtarı yok. Canlı çekim kapalı.",
    };
  }
  return {
    ok: false as const,
    error: "PayTR imza doğrulaması bağlı değil. Canlı çekim kapalı.",
  };
}

export function liveChargeClosed() {
  const provider = activeProvider();
  if (provider === "iyzico") {
    return iyzicoCharge().error;
  }
  if (provider === "paytr") {
    return paytrCharge().error;
  }
  return null;
}
