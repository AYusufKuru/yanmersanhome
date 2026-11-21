"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getCustomer } from "@/lib/account";
import { getAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  answerSchema,
  feedbackIssue,
  questionSchema,
  questionUpdateSchema,
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

export async function updateQuestion(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "Soruyu düzenlemek için üye girişi gerekli." };
  }

  const parsed = questionUpdateSchema.safeParse({
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

    const updated = await prisma.productQuestion.updateMany({
      where: {
        id: parsed.data.questionId,
        productId: product.id,
        userId: customer.id,
      },
      data: { body: parsed.data.body },
    });
    if (updated.count === 0) {
      return { error: "Bu soruyu düzenleyemezsiniz." };
    }
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Soru güncellenemedi.");
    return { error: "Soru şu an güncellenemedi." };
  }

  return { saved: true };
}

export async function deleteQuestion(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const customer = await getCustomer();
  if (!customer) {
    return { error: "Soruyu silmek için üye girişi gerekli." };
  }

  const parsed = questionUpdateSchema.pick({ slug: true, questionId: true }).safeParse({
    slug: formData.get("slug"),
    questionId: formData.get("questionId"),
  });
  if (!parsed.success) {
    return { error: feedbackIssue(parsed.error) };
  }

  try {
    const product = await activeProduct(parsed.data.slug);
    if (!product) {
      return { error: "Ürün bulunamadı." };
    }

    const removed = await prisma.productQuestion.deleteMany({
      where: {
        id: parsed.data.questionId,
        productId: product.id,
        userId: customer.id,
      },
    });
    if (removed.count === 0) {
      return { error: "Bu soruyu silemezsiniz." };
    }
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Soru silinemedi.");
    return { error: "Soru şu an silinemedi." };
  }

  return { saved: true };
}

export async function answerQuestion(
  _state: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const parentRaw = formData.get("parentId");
  const parsed = answerSchema.safeParse({
    slug: formData.get("slug"),
    questionId: formData.get("questionId"),
    parentId: typeof parentRaw === "string" && parentRaw ? parentRaw : undefined,
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
      select: { id: true, userId: true },
    });
    if (!question) {
      return { error: "Soru bulunamadı." };
    }

    if (!parsed.data.parentId) {
      const admin = await getAdmin();
      if (!admin) {
        return { error: "Soruyu yalnızca yönetici cevaplayabilir." };
      }
      await prisma.productAnswer.create({
        data: {
          questionId: question.id,
          userId: admin.id,
          body: parsed.data.body,
        },
      });
    } else {
      const customer = await getCustomer();
      if (!customer || question.userId !== customer.id) {
        return {
          error: "Yalnızca kendi sorunuzdaki yönetici cevabına yanıt yazabilirsiniz.",
        };
      }
      const parent = await prisma.productAnswer.findFirst({
        where: {
          id: parsed.data.parentId,
          questionId: question.id,
          parentId: null,
          user: { role: "ADMIN" },
        },
        select: { id: true, _count: { select: { replies: true } } },
      });
      if (!parent) {
        return {
          error: "Yalnızca yönetici cevabına yanıt yazabilirsiniz.",
        };
      }
      if (parent._count.replies >= 20) {
        return { error: "Bu cevaba en fazla 20 yanıt yazabilirsiniz." };
      }
      await prisma.productAnswer.create({
        data: {
          questionId: question.id,
          parentId: parent.id,
          userId: customer.id,
          body: parsed.data.body,
        },
      });
    }
    refreshProduct(product.slug, product.category.slug);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Cevap kaydedilemedi.");
    return { error: "Cevap şu an kaydedilemedi." };
  }

  return { saved: true };
}
