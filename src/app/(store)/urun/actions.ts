"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getCustomer } from "@/lib/account";
import { prisma } from "@/lib/db";
import {
  answerSchema,
  feedbackIssue,
  questionSchema,
  reviewSchema,
} from "@/lib/feedback-schema";

export type FeedbackState = { error?: string; saved?: boolean };

async function activeProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });
}

function refreshProduct(slug: string, categorySlug: string) {
  revalidatePath(`/urun/${slug}`);
  revalidatePath("/");
  revalidatePath(`/kategori/${categorySlug}`);
  revalidatePath("/ara");
}

export async function saveReview(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "Değerlendirme için üye girişi gerekli." };
  }

  const parsed = reviewSchema.safeParse({
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: feedbackIssue(parsed.error) };
  }

  try {
    const product = await activeProduct(parsed.data.slug);
    if (!product) {
      return { error: "Ürün bulunamadı." };
    }

    await prisma.review.upsert({
      where: {
        productId_userId: { productId: product.id, userId: customer.id },
      },
      create: {
        productId: product.id,
        userId: customer.id,
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
      update: {
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
    });
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Değerlendirme kaydedilemedi.");
    return { error: "Değerlendirme şu an kaydedilemedi." };
  }

  return { saved: true };
}

export async function askQuestion(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "Soru sormak için üye girişi gerekli." };
  }

  const parsed = questionSchema.safeParse({
    slug: formData.get("slug"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: feedbackIssue(parsed.error) };
  }

  try {
    const product = await activeProduct(parsed.data.slug);
    if (!product) {
      return { error: "Ürün bulunamadı." };
    }

    const recent = await prisma.productQuestion.count({
      where: { productId: product.id, userId: customer.id },
    });
    if (recent >= 20) {
      return { error: "Bu ürüne en fazla 20 soru yazabilirsiniz." };
    }

    await prisma.productQuestion.create({
      data: {
        productId: product.id,
        userId: customer.id,
        body: parsed.data.body,
      },
    });
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Soru kaydedilemedi.");
    return { error: "Soru şu an kaydedilemedi." };
  }

  return { saved: true };
}

export async function answerQuestion(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "Cevap yazmak için üye girişi gerekli." };
  }

  const parsed = answerSchema.safeParse({
    slug: formData.get("slug"),
    questionId: formData.get("questionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: feedbackIssue(parsed.error) };
  }

  try {
    const product = await activeProduct(parsed.data.slug);
    if (!product) {
      return { error: "Ürün bulunamadı." };
    }

    const question = await prisma.productQuestion.findFirst({
      where: { id: parsed.data.questionId, productId: product.id },
      select: { id: true },
    });
    if (!question) {
      return { error: "Soru bulunamadı." };
    }

    await prisma.productAnswer.create({
      data: {
        questionId: question.id,
        userId: customer.id,
        body: parsed.data.body,
      },
    });
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Cevap kaydedilemedi.");
    return { error: "Cevap şu an kaydedilemedi." };
  }

  return { saved: true };
}
