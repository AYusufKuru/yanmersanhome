import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Geçerli bir e-posta yazın." })),
  password: z.string().min(1, { error: "Şifre gerekli." }),
});

export const adminSeedSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "ADMIN_EMAIL geçerli bir e-posta olmalı." })),
  password: z
    .string()
    .min(12, { error: "ADMIN_PASSWORD en az 12 karakter olmalı." })
    .regex(/[A-Za-z]/, { error: "ADMIN_PASSWORD en az bir harf içermeli." })
    .regex(/[0-9]/, { error: "ADMIN_PASSWORD en az bir rakam içermeli." }),
  name: z.string().trim().min(2).max(80),
});
