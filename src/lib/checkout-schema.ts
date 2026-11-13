import { z } from "zod";

const text = (min: number, max: number, message: string) =>
  z.string().trim().min(min, { error: message }).max(max);

export const checkoutSchema = z
  .object({
    fullName: text(2, 80, "Ad soyad en az 2 karakter olmalı."),
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[^\d+]/g, ""))
      .refine((value) => /^\+?\d{10,13}$/.test(value), {
        error: "Telefon numarası geçersiz.",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "Geçerli bir e-posta yazın." })),
    city: text(2, 40, "Şehir yazın."),
    district: text(2, 40, "İlçe yazın."),
    addressLine: text(5, 300, "Açık adres en az 5 karakter olmalı."),
    postalCode: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d{5}$/.test(value), {
        error: "Posta kodu 5 rakam olmalı.",
      }),
    note: z.string().trim().max(500),
    invoiceType: z.enum(["INDIVIDUAL", "COMPANY"], {
      error: "Fatura türü seçin.",
    }),
    companyName: z.string().trim().max(120),
    taxNumber: z.string().trim().max(11),
    taxOffice: z.string().trim().max(80),
  })
  .superRefine((value, context) => {
    if (value.invoiceType !== "COMPANY") {
      return;
    }
    if (value.companyName.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Kurumsal faturada ünvan gerekli.",
      });
    }
    if (!/^\d{10,11}$/.test(value.taxNumber)) {
      context.addIssue({
        code: "custom",
        path: ["taxNumber"],
        message: "Vergi numarası 10 veya 11 rakam olmalı.",
      });
    }
    if (value.taxOffice.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["taxOffice"],
        message: "Vergi dairesi gerekli.",
      });
    }
  });

export function checkoutIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Sipariş bilgileri geçersiz.";
}
