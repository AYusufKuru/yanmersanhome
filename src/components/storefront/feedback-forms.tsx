"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  answerQuestion,
  askQuestion,
  saveReview,
  type FeedbackState,
} from "@/app/(store)/urun/actions";
import { StarMark } from "@/components/storefront/rating-summary";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none";

const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60";

function FormNote({ state }: { state: FeedbackState }) {
  if (state.error) {
    return (
      <p role="alert" className="mt-3 text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.saved) {
    return <p className="mt-3 text-sm text-success">Kaydedildi.</p>;
  }
  return null;
}

export function ReviewForm({
  slug,
  initialRating = 0,
  initialBody = "",
  editing = false,
}: {
  slug: string;
  initialRating?: number;
  initialBody?: string;
  editing?: boolean;
}) {
  const [state, action, pending] = useActionState(saveReview, {});
  const [rating, setRating] = useState(initialRating);

  return (
    <form action={action} className="mt-6 max-w-xl">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating > 0 ? rating : ""} />
      <fieldset>
        <legend className="text-sm text-espresso">
          {editing ? "Puanını güncelle" : "Puanın"}
        </legend>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            const selected = rating === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                aria-label={`${value} yıldız`}
                onClick={() => setRating(value)}
                className="rounded-full p-1"
              >
                <StarMark fill={rating >= value ? 1 : 0} size="md" />
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="mt-4 block text-sm text-espresso">
        Yorumun
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={800}
          rows={4}
          defaultValue={initialBody}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending || rating < 1}
        className={`mt-4 ${buttonClass}`}
      >
        {pending
          ? "Kaydediliyor"
          : editing
            ? "Değerlendirmeyi güncelle"
            : "Değerlendirmeyi gönder"}
      </button>
      <FormNote state={state} />
    </form>
  );
}

export function QuestionForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(askQuestion, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-6 max-w-xl">
      <input type="hidden" name="slug" value={slug} />
      <label className="block text-sm text-espresso">
        Sorun
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={400}
          rows={3}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`mt-4 ${buttonClass}`}
      >
        {pending ? "Gönderiliyor" : "Soruyu gönder"}
      </button>
      <FormNote state={state} />
    </form>
  );
}

export function AnswerForm({
  slug,
  questionId,
}: {
  slug: string;
  questionId: string;
}) {
  const [state, action, pending] = useActionState(answerQuestion, {});
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) {
      formRef.current?.reset();
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-sm text-coffee"
      >
        Cevap yaz
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="mt-3 max-w-xl">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="questionId" value={questionId} />
      <label className="block text-sm text-espresso">
        Cevabın
        <textarea
          name="body"
          required
          minLength={2}
          maxLength={800}
          rows={3}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`mt-3 ${buttonClass}`}
      >
        {pending ? "Gönderiliyor" : "Cevabı gönder"}
      </button>
      <FormNote state={state} />
    </form>
  );
}
