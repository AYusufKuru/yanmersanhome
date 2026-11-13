import { NextResponse } from "next/server";
import { callbackSchema } from "@/lib/payments/callback-schema";
import { PaymentError, settlePayment } from "@/lib/payments/settle";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = callbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Canlı çekim kapalı. Bildirim kabul edilmedi." },
      { status: 400 },
    );
  }

  try {
    const outcome = await settlePayment(parsed.data);
    return NextResponse.json({ outcome });
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
