import { createHmac, timingSafeEqual } from "node:crypto";

export type PaymentPayload = {
  provider: string;
  orderId: string;
  status: string;
  amount: string;
  providerRef: string;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }
  return secret;
}

export function paymentPayload(body: PaymentPayload) {
  return [
    body.provider,
    body.orderId,
    body.status,
    body.amount,
    body.providerRef,
  ].join("|");
}

export function signPayment(body: PaymentPayload) {
  return createHmac("sha256", authSecret())
    .update(paymentPayload(body))
    .digest("base64url");
}

export function verifyPayment(body: PaymentPayload, signature: string) {
  const expected = signPayment(body);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
