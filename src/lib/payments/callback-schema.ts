import { z } from "zod";

export const callbackSchema = z.object({
  provider: z.literal("mock"),
  orderId: z.string().min(1).max(64),
  status: z.enum(["SUCCEEDED", "FAILED"]),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  providerRef: z.string().regex(/^mock_[a-f0-9]{16}$/),
  signature: z.string().min(20).max(200),
});
