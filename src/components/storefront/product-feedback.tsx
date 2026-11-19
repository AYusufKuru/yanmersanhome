import Link from "next/link";
import {
  AnswerForm,
  QuestionForm,
  ReviewForm,
} from "@/components/storefront/feedback-forms";
import { StarRow } from "@/components/storefront/rating-summary";
import { formatPersonName } from "@/lib/format";

type Author = { name: string };

export type ProductReview = {
  id: string;
  rating: number;
  body: string;
  createdAt: Date;
  user: Author;
};

export type ProductQuestionItem = {
  id: string;
  body: string;
  createdAt: Date;
  user: Author;
  answers: {
    id: string;
    body: string;
    createdAt: Date;
    user: Author;
  }[];
};

function day(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
    value,
  );
}

function MemberPrompt({ text }: { text: string }) {
  return (
    <p className="mt-4 text-base text-espresso/80">
      {text}{" "}
      <Link href="/hesap?bolum=giris" className="text-coffee underline">
        Üye girişi
      </Link>
    </p>
  );
}

export function ProductFeedback({
  slug,
  signedIn,
  ownReview,
  reviews,
  questions,
}: {
  slug: string;
  signedIn: boolean;
  ownReview: { rating: number; body: string } | null;
  reviews: ProductReview[];
  questions: ProductQuestionItem[];
}) {
  return (
    <>
      <section
        id="degerlendirmeler"
        className="surface-panel mt-8 scroll-mt-24 rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"
      >
        <h2 className="font-display text-3xl text-espresso">
          Değerlendirmeler
        </h2>
        {signedIn ? (
          <ReviewForm
            key={`${ownReview?.rating ?? 0}-${ownReview?.body ?? ""}`}
            slug={slug}
            initialRating={ownReview?.rating ?? 0}
            initialBody={ownReview?.body ?? ""}
            editing={ownReview !== null}
          />
        ) : (
          <MemberPrompt text="Yorum ve puan için üye girişi gerekli." />
        )}
        {reviews.length > 0 ? (
          <ul className="mt-8 space-y-6">
            {reviews.map((review) => (
              <li key={review.id} className="border-t border-line pt-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRow value={review.rating} />
                  <p className="text-sm text-espresso">
                    {formatPersonName(review.user.name)}
                  </p>
                  <p className="text-sm text-muted">{day(review.createdAt)}</p>
                </div>
                <p className="mt-3 max-w-2xl text-base leading-7 whitespace-pre-line text-espresso/80">
                  {review.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-base text-espresso/70">
            Henüz değerlendirme yok.
          </p>
        )}
      </section>
      <section
        id="soru-cevap"
        className="surface-panel mt-8 scroll-mt-24 rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"
      >
        <h2 className="font-display text-3xl text-espresso">Soru-Cevap</h2>
        {signedIn ? (
          <QuestionForm key={questions.length} slug={slug} />
        ) : (
          <MemberPrompt text="Soru sormak için üye girişi gerekli." />
        )}
        {questions.length > 0 ? (
          <ul className="mt-8 space-y-8">
            {questions.map((question) => (
              <li key={question.id} className="border-t border-line pt-6">
                <p className="text-sm text-muted">
                  {formatPersonName(question.user.name)} ·{" "}
                  {day(question.createdAt)}
                </p>
                <p className="mt-2 max-w-2xl text-base leading-7 whitespace-pre-line text-espresso">
                  {question.body}
                </p>
                {question.answers.length > 0 ? (
                  <ul className="mt-4 space-y-4 border-l border-line pl-4">
                    {question.answers.map((answer) => (
                      <li key={answer.id}>
                        <p className="text-sm text-muted">
                          {formatPersonName(answer.user.name)} ·{" "}
                          {day(answer.createdAt)}
                        </p>
                        <p className="mt-1 max-w-2xl text-base leading-7 whitespace-pre-line text-espresso/80">
                          {answer.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {signedIn ? (
                  <AnswerForm slug={slug} questionId={question.id} />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-base text-espresso/70">Henüz soru yok.</p>
        )}
      </section>
    </>
  );
}
