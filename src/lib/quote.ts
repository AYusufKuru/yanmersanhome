export type QuoteLine = {
  unitKurus: number;
  quantity: number;
  stock: number;
  active: boolean;
};

export type QuoteCoupon = {
  type: "PERCENT" | "FIXED";
  /** Yüzde için 10 = %10. Sabit tutar kuruş cinsindendir. */
  amount: number;
  minSubtotalKurus: number | null;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageCount: number;
  usageLimit: number | null;
  perUserCount: number | null;
  perUserLimit: number | null;
};

export type QuoteInput = {
  lines: QuoteLine[];
  coupon: QuoteCoupon | null;
  shippingFeeKurus: number;
  freeShippingLimitKurus: number | null;
  now: Date;
};

export type PricedLine = {
  index: number;
  quantity: number;
  lineKurus: number;
  available: boolean;
};

export type QuoteResult = {
  lines: PricedLine[];
  subtotalKurus: number;
  discountKurus: number;
  shippingKurus: number;
  totalKurus: number;
  couponMessage: string | null;
};

function clampQuantity(line: QuoteLine) {
  if (!line.active || line.stock <= 0 || line.unitKurus < 0) {
    return 0;
  }
  return Math.min(Math.max(line.quantity, 0), line.stock);
}

function couponMessage(coupon: QuoteCoupon, subtotalKurus: number, now: Date) {
  if (!coupon.active) {
    return "Bu kupon geçerli değil.";
  }
  if (coupon.startsAt && coupon.startsAt > now) {
    return "Bu kupon henüz başlamadı.";
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return "Bu kuponun süresi doldu.";
  }
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return "Bu kuponun kullanım hakkı doldu.";
  }
  if (
    coupon.perUserLimit !== null &&
    coupon.perUserCount !== null &&
    coupon.perUserCount >= coupon.perUserLimit
  ) {
    return "Bu kuponu daha önce kullandınız.";
  }
  if (
    coupon.minSubtotalKurus !== null &&
    subtotalKurus < coupon.minSubtotalKurus
  ) {
    return "Bu kupon için sepet tutarı yetersiz.";
  }
  if (
    coupon.type === "PERCENT" &&
    (coupon.amount <= 0 || coupon.amount > 100)
  ) {
    return "Bu kupon geçerli değil.";
  }
  if (coupon.type === "FIXED" && coupon.amount <= 0) {
    return "Bu kupon geçerli değil.";
  }
  return null;
}

export function quoteCart(input: QuoteInput): QuoteResult {
  const lines = input.lines.map((line, index) => {
    const quantity = clampQuantity(line);
    return {
      index,
      quantity,
      lineKurus: quantity * line.unitKurus,
      available: quantity > 0,
    };
  });
  const subtotalKurus = lines.reduce(
    (sum, line) => sum + (line.available ? line.lineKurus : 0),
    0,
  );

  let discountKurus = 0;
  let message: string | null = null;
  if (input.coupon) {
    message = couponMessage(input.coupon, subtotalKurus, input.now);
    if (!message && subtotalKurus > 0) {
      if (input.coupon.type === "PERCENT") {
        discountKurus = Math.round((subtotalKurus * input.coupon.amount) / 100);
      } else {
        discountKurus = Math.min(input.coupon.amount, subtotalKurus);
      }
      discountKurus = Math.min(Math.max(discountKurus, 0), subtotalKurus);
    }
  }

  const afterDiscount = subtotalKurus - discountKurus;
  const free =
    input.freeShippingLimitKurus !== null &&
    afterDiscount >= input.freeShippingLimitKurus;
  const shippingKurus =
    subtotalKurus === 0 || free ? 0 : Math.max(input.shippingFeeKurus, 0);
  const totalKurus = afterDiscount + shippingKurus;

  return {
    lines,
    subtotalKurus,
    discountKurus,
    shippingKurus,
    totalKurus,
    couponMessage: message,
  };
}

export function lira(kurus: number) {
  return kurus / 100;
}
