"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnswerForm,
  OwnQuestion,
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
  mine: boolean;
  user: Author;
  answers: {
    id: string;
    body: string;
    createdAt: Date;
    fromAdmin: boolean;
    user: Author;
    replies: {
      id: string;
      body: string;
      createdAt: Date;
      user: Author;
    }[];
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

export type ProductFact = {
  label: string;
  value: string;
};

type Panel = "aciklama" | "bilgi" | "degerlendirmeler" | "soru-cevap";

function panelFromHash(hash: string): Panel | null {
  if (
    hash === "#aciklama" ||
    hash === "#bilgi" ||
    hash === "#degerlendirmeler" ||
    hash === "#soru-cevap"
  ) {
    return hash.slice(1) as Panel;
  }
  return null;
}

export function ProductFeedback({
  slug,
  description,
  facts,
  signedIn,
  isAdmin,
  ownReview,
  reviews,
  questions,
  reviewCount,
  questionCount,
}: {
  slug: string;
  description: string;
  facts: ProductFact[];
  signedIn: boolean;
  isAdmin: boolean;
  ownReview: { rating: number; body: string } | null;
  reviews: ProductReview[];
  questions: ProductQuestionItem[];
  reviewCount: number;
  questionCount: number;
}) {
  const [panel, setPanel] = useState<Panel>("aciklama");

  useEffect(() => {
    function sync() {
      const next = panelFromHash(window.location.hash);
      if (next) {
        setPanel(next);
      }
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const tabs: { id: Panel; label: string }[] = [
    { id: "aciklama", label: "Ürün açıklaması" },
    { id: "bilgi", label: "Ürün bilgileri" },
    { id: "degerlendirmeler", label: `Değerlendirme (${reviewCount})` },
    { id: "soru-cevap", label: `Soru-Cevap (${questionCount})` },
  ];

  return (
    <section
      id="urun-kart"
      className="surface-panel mt-8 scroll-mt-24 rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10"
    >
      <div role="tablist" aria-label="Ürün ayrıntıları" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line">
        {tabs.map((tab) => {
          const selected = panel === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tab.id}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => {
                setPanel(tab.id);
                history.pushState(null, "", `#${tab.id}`);
              }}
              className={`border-b-2 pb-3 text-sm sm:text-base ${
                selected
                  ? "border-coffee text-espresso"
                  : "border-transparent text-muted hover:text-espresso"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {panel === "aciklama" ? (
        <div
          role="tabpanel"
          id="panel-aciklama"
          aria-labelledby="aciklama"
          className="pt-6"
        >
          {description ? (
            <p className="max-w-3xl text-base leading-8 whitespace-pre-line text-espresso/80 sm:text-lg">
              {description}
            </p>
          ) : (
            <p className="text-base text-muted">Bu ürün için açıklama yok.</p>
          )}
        </div>
      ) : null}

      {panel === "bilgi" ? (
        <div
          role="tabpanel"
          id="panel-bilgi"
          aria-labelledby="bilgi"
          className="pt-6"
        >
          <dl className="overflow-hidden rounded-3xl border border-line bg-card">
            {facts.map((fact, index) => (
              <div
                key={`${fact.label}-${index}`}
                className="grid gap-1 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-8"
              >
                <dt className="text-sm text-muted">{fact.label}</dt>
                <dd className="text-base text-espresso">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {panel === "degerlendirmeler" ? (
        <div
          role="tabpanel"
          id="panel-degerlendirmeler"
          aria-labelledby="degerlendirmeler"
          className="pt-2"
        >
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
        </div>
      ) : null}

      {panel === "soru-cevap" ? (
        <div
          role="tabpanel"
          id="panel-soru-cevap"
          aria-labelledby="soru-cevap"
          className="pt-2"
        >
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
                {question.mine ? (
                  <OwnQuestion
                    key={question.body}
                    slug={slug}
                    questionId={question.id}
                    initialBody={question.body}
                  />
                ) : null}
                {question.answers.length > 0 ? (
                  <ul className="mt-4 space-y-4 border-l border-line pl-4">
                    {question.answers.map((answer) => (
                      <li key={answer.id}>
                        <p className="text-sm text-muted">
                          {formatPersonName(answer.user.name)}
                          {answer.fromAdmin ? " · Yönetici" : ""} ·{" "}
                          {day(answer.createdAt)}
                        </p>
                        <p className="mt-1 max-w-2xl text-base leading-7 whitespace-pre-line text-espresso/80">
                          {answer.body}
                        </p>
                        {answer.replies.length > 0 ? (
                          <ul className="mt-3 space-y-3 border-l border-line pl-4">
                            {answer.replies.map((reply) => (
                              <li key={reply.id}>
                                <p className="text-sm text-muted">
                                  {formatPersonName(reply.user.name)} ·{" "}
                                  {day(reply.createdAt)}
                                </p>
                                <p className="mt-1 max-w-2xl text-base leading-7 whitespace-pre-line text-espresso/80">
                                  {reply.body}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {question.mine && answer.fromAdmin ? (
                          <AnswerForm
                            slug={slug}
                            questionId={question.id}
                            parentId={answer.id}
                            label="Yanıtla"
                            fieldLabel="Yanıtın"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {isAdmin ? (
                  <AnswerForm slug={slug} questionId={question.id} />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-base text-espresso/70">Henüz soru yok.</p>
        )}
        </div>
      ) : null}
    </section>
  );
}
