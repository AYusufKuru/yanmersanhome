"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  answerQuestion,
  askQuestion,
  deleteQuestion,
  saveReview,
  updateQuestion,
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

export function OwnQuestion({
  slug,
  questionId,
  initialBody,
}: {
  slug: string;
  questionId: string;
  initialBody: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editState, editAction, editPending] = useActionState(updateQuestion, {});
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteQuestion,
    {},
  );

  return (
    <div className="mt-3">
      {editing ? (
        <form action={editAction} className="max-w-xl">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="questionId" value={questionId} />
          <label className="block text-sm text-espresso">
            Sorun
            <textarea
              name="body"
              required
              minLength={10}
              maxLength={400}
              rows={3}
              defaultValue={initialBody}
              className={fieldClass}
            />
          </label>
          <div className="mt-3 flex gap-3">
            <button type="submit" disabled={editPending} className={buttonClass}>
              {editPending ? "Kaydediliyor" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-muted"
            >
              Vazgeç
            </button>
          </div>
          <FormNote state={editState} />
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setEditing(true);
            }}
            className="text-sm text-coffee"
          >
            Düzenle
          </button>
          {confirming ? (
            <form action={deleteAction} className="flex items-center gap-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="questionId" value={questionId} />
              <button
                type="submit"
                disabled={deletePending}
                className="text-sm text-danger"
              >
                {deletePending ? "Siliniyor" : "Evet, sil"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-sm text-muted"
              >
                Vazgeç
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-sm text-muted"
            >
              Sil
            </button>
          )}
        </div>
      )}
      <FormNote state={deleteState} />
    </div>
  );
}

export function AnswerForm({
  slug,
  questionId,
  parentId,
  label = "Cevap yaz",
  fieldLabel = "Cevabın",
}: {
  slug: string;
  questionId: string;
  parentId?: string;
  label?: string;
  fieldLabel?: string;
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
        {label}
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="mt-3 max-w-xl">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="questionId" value={questionId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <label className="block text-sm text-espresso">
        {fieldLabel}
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
