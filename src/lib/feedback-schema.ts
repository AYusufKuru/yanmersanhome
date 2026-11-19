import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "Ürün bulunamadı." });

export const reviewSchema = z.object({
  slug,
  rating: z.coerce
    .number({ error: "Puan seçin." })
    .int()
    .min(1, { error: "Puan 1 ile 5 arasında olmalı." })
    .max(5, { error: "Puan 1 ile 5 arasında olmalı." }),
  body: z
    .string()
    .trim()
    .min(10, { error: "Yorum en az 10 karakter olmalı." })
    .max(800, { error: "Yorum en fazla 800 karakter olmalı." }),
});

export const questionSchema = z.object({
  slug,
  body: z
    .string()
    .trim()
    .min(10, { error: "Soru en az 10 karakter olmalı." })
    .max(400, { error: "Soru en fazla 400 karakter olmalı." }),
});

export const answerSchema = z.object({
  slug,
  questionId: z.string().trim().min(1).max(40),
  body: z
    .string()
    .trim()
    .min(2, { error: "Cevap en az 2 karakter olmalı." })
    .max(800, { error: "Cevap en fazla 800 karakter olmalı." }),
});

export function feedbackIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Bilgiler geçersiz.";
}
