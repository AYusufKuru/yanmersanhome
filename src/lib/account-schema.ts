import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Geçerli bir e-posta yazın." }));

export const passwordSchema = z
  .string()
  .min(8, { error: "Şifre en az 8 karakter olmalı." })
  .max(72, { error: "Şifre en fazla 72 karakter olmalı." })
  .regex(/[A-Za-z]/, { error: "Şifre en az bir harf içermeli." })
  .regex(/[0-9]/, { error: "Şifre en az bir rakam içermeli." });

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^\d+]/g, ""))
  .refine((value) => value === "" || /^\+?\d{10,13}$/.test(value), {
    error: "Telefon numarası geçersiz.",
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Ad soyad en az 2 karakter olmalı." })
      .max(80),
    email,
    phone,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: "Şifreyi yeniden yazın." }),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Şifreler aynı değil.",
      });
    }
  });

export const customerLoginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Şifre gerekli." }),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Ad soyad en az 2 karakter olmalı." })
    .max(80),
  phone,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Mevcut şifre gerekli." }),
    nextPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { error: "Yeni şifreyi yeniden yazın." }),
  })
  .superRefine((value, context) => {
    if (value.nextPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Yeni şifreler aynı değil.",
      });
    }
  });

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Ad soyad en az 2 karakter olmalı." })
    .max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[^\d+]/g, ""))
    .refine((value) => /^\+?\d{10,13}$/.test(value), {
      error: "Telefon numarası geçersiz.",
    }),
  city: z.string().trim().min(2, { error: "Şehir yazın." }).max(40),
  district: z.string().trim().min(2, { error: "İlçe yazın." }).max(40),
  line: z
    .string()
    .trim()
    .min(5, { error: "Açık adres en az 5 karakter olmalı." })
    .max(300),
  postalCode: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{5}$/.test(value), {
      error: "Posta kodu 5 rakam olmalı.",
    }),
});

export const guestLookupSchema = z.object({
  number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^YM-[A-F0-9]{8}$/, { error: "Sipariş numarası YM- ile başlar." }),
  email,
});

export function accountIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Bilgiler geçersiz.";
}
