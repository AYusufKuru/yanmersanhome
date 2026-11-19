import { prisma } from "@/lib/db";

export type ProductFeedback = {
  ratingAverage: number | null;
  reviewCount: number;
  questionCount: number;
};

export const emptyFeedback: ProductFeedback = {
  ratingAverage: null,
  reviewCount: 0,
  questionCount: 0,
};

const listCap = 40;

export async function feedbackStats(productIds: string[]) {
  const stats = new Map<string, ProductFeedback>();
  if (productIds.length === 0) {
    return stats;
  }

  const [reviews, questions] = await Promise.all([
    prisma.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.productQuestion.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _count: { _all: true },
    }),
  ]);

  for (const row of reviews) {
    const average = row._avg.rating;
    stats.set(row.productId, {
      ratingAverage:
        average !== null && Number.isFinite(average) ? average : null,
      reviewCount: row._count._all,
      questionCount: 0,
    });
  }

  for (const row of questions) {
    const current = stats.get(row.productId) ?? { ...emptyFeedback };
    current.questionCount = row._count._all;
    stats.set(row.productId, current);
  }

  return stats;
}

export async function getProductConversation(
  productId: string,
  viewerId: string | null,
) {
  const [reviews, questions, ownReview] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: listCap,
      select: {
        id: true,
        rating: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.productQuestion.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: listCap,
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
        answers: {
          orderBy: { createdAt: "asc" },
          take: 20,
          select: {
            id: true,
            body: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
    viewerId
      ? prisma.review.findUnique({
          where: { productId_userId: { productId, userId: viewerId } },
          select: { rating: true, body: true },
        })
      : Promise.resolve(null),
  ]);

  return { reviews, questions, ownReview };
}
