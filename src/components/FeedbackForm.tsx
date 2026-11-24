"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  BookOpen,
  Bug,
  Check,
  Copy,
  Hand,
  Heart,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CHAPTER_CATALOG,
  COPY,
  RATING_CAPTIONS,
} from "@/lib/i18n";
import {
  FEEDBACK_CATEGORIES,
  type BeBaduyChapter,
  type FeedbackCategory,
  type Locale,
} from "@/lib/types";
import { HumaGlassCard } from "./HumaGlassCard";

interface FeedbackFormProps {
  locale: Locale;
  selectedChapter: BeBaduyChapter;
  onChapterChange: (chapter: BeBaduyChapter) => void;
}

interface SubmissionReceipt {
  referenceCode: string;
  category: FeedbackCategory;
  chapter: BeBaduyChapter;
  rating: number;
}

const CATEGORY_ICONS: Record<FeedbackCategory, typeof Bug> = {
  bug: Bug,
  feature: Sparkles,
  culture: BookOpen,
  interaction: Hand,
  appreciation: Heart,
  other: MessageCircle,
};

export function FeedbackForm({
  locale,
  selectedChapter,
  onChapterChange,
}: FeedbackFormProps) {
  const t = COPY[locale];

  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const activeDisplayRating = hoveredRating ?? rating;
  const activeCategoryCopy = CATEGORY_LABELS[category][locale];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 5) {
      setErrorMessage(t.errorMinMessage);
      return;
    }

    const trimmedEmail = email.trim();
    if (
      trimmedEmail.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      setErrorMessage(t.errorEmail);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          chapter: selectedChapter,
          message: trimmedMessage,
          name: name.trim() || undefined,
          email: trimmedEmail || undefined,
          deviceInfo: deviceInfo.trim() || undefined,
          appVersion: appVersion.trim() || undefined,
          locale,
          website,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        referenceCode?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.referenceCode) {
        setErrorMessage(data.error || t.errorGeneric);
        return;
      }

      setReceipt({
        referenceCode: data.referenceCode,
        category,
        chapter: selectedChapter,
        rating,
      });
      setMessage("");
      setWebsite("");
    } catch {
      setErrorMessage(t.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyReference() {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.referenceCode);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore clipboard failures on restricted contexts
    }
  }

  function handleReset() {
    setReceipt(null);
    setErrorMessage(null);
    setCopiedCode(false);
  }

  if (receipt) {
    const chapterMeta =
      CHAPTER_CATALOG.find((item) => item.id === receipt.chapter) ??
      CHAPTER_CATALOG[0];

    return (
      <HumaGlassCard
        className="animate-huma-enter"
        contentClassName="px-6 py-10 sm:px-10 sm:py-12"
      >
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#f5a640]/70 bg-[#d05c00]/25 shadow-[0_0_32px_rgba(245,166,64,0.32)]">
            <img
              src="/brand/rice-emblem.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#94c796]/40 bg-[#305e40]/35 px-3 py-1 text-xs font-semibold tracking-wide text-[#c8ebd0]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {t.thankYouBadge}
          </span>

          <h2 className="font-rounded mt-4 text-3xl font-extrabold text-[#fff6ed] sm:text-4xl">
            {t.thankYouTitle}
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-[#f7e7d4]/88">
            {t.thankYouBody}
          </p>

          <div className="mt-6 w-full rounded-2xl border border-[#f5a640]/35 bg-[#1b120b]/70 p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#f7b266]/85 uppercase">
              {t.thankYouRefLabel}
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-2.5">
              <span className="font-rounded text-2xl font-extrabold tracking-wider text-[#fff6ed]">
                {receipt.referenceCode}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="tactile-press inline-flex items-center gap-1 rounded-full border border-[#f5a640]/40 bg-[#2d2016] px-2.5 py-1 text-xs font-semibold text-[#f7b266] hover:border-[#f5a640]"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#94c796]" />
                    {t.thankYouCopied}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t.thankYouCopy}
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-[#f5a640]/15 pt-3 text-xs text-[#f7e7d4]/80">
              <span className="rounded-full bg-[#f5a640]/15 px-2.5 py-0.5 text-[#f7b266]">
                {"★".repeat(receipt.rating)} ({receipt.rating}/5)
              </span>
              <span className="rounded-full bg-[#fff6ed]/10 px-2.5 py-0.5">
                {CATEGORY_LABELS[receipt.category][locale].label}
              </span>
              <span className="rounded-full bg-[#fff6ed]/10 px-2.5 py-0.5">
                {chapterMeta.title[locale]}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="bebaduy-capsule-btn mt-7 inline-flex min-h-12 items-center justify-center gap-2 px-7 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.thankYouAnother}
          </button>
        </div>
      </HumaGlassCard>
    );
  }

  return (
    <HumaGlassCard
      className="animate-huma-enter"
      contentClassName="px-5 pt-11 pb-8 sm:px-8 sm:pt-11 sm:pb-9"
    >
      <div className="mb-6">
        <h2 className="font-rounded text-2xl font-extrabold tracking-tight text-[#f7b266] sm:text-[28px]">
          {t.formTitle}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#fff6ed]/80 sm:text-[15px]">
          {t.formSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Anti-spam honeypot */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="website-field">Website</label>
          <input
            id="website-field"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* 1. Experience Rating */}
        <div>
          <span className="block text-sm font-semibold text-[#fff6ed]">
            {t.ratingLabel}
          </span>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <div
              role="radiogroup"
              aria-label={t.ratingLabel}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#f5a640]/30 bg-[#1a110b]/70 px-3 py-1.5"
              onMouseLeave={() => setHoveredRating(null)}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const isLit = value <= activeDisplayRating;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} / 5 - ${RATING_CAPTIONS[value][locale]}`}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    className="tactile-press flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#f7b266]"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors duration-150 ${
                        isLit
                          ? "fill-[#f5a640] text-[#ffd48a] drop-shadow-[0_0_8px_rgba(245,166,64,0.55)]"
                          : "fill-transparent text-[#f7e7d4]/35"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-sm font-medium text-[#f7b266]">
              {RATING_CAPTIONS[activeDisplayRating][locale]}
            </span>
          </div>
        </div>

        {/* 2. Topic / Category */}
        <div>
          <span className="block text-sm font-semibold text-[#fff6ed]">
            {t.categoryLabel}
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {FEEDBACK_CATEGORIES.map((item) => {
              const Icon = CATEGORY_ICONS[item];
              const isSelected = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={isSelected}
                  className={`tactile-press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm ${
                    isSelected
                      ? "border-[#ff9e3d] bg-[#d05c00]/32 text-[#fff6ed] shadow-[0_0_0_1px_rgba(255,158,61,0.35)]"
                      : "border-[#f5a640]/25 bg-[#1b120b]/60 text-[#f7e7d4]/82 hover:border-[#f5a640]/55 hover:bg-[#261a11]"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isSelected ? "text-[#ffd28a]" : "text-[#f7b266]/75"
                    }`}
                    aria-hidden="true"
                  />
                  {CATEGORY_LABELS[item][locale].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Chapter Selector */}
        <div>
          <span className="block text-sm font-semibold text-[#fff6ed]">
            {t.chapterLabel}
          </span>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {CHAPTER_CATALOG.map((chapter) => {
              const isSelected = selectedChapter === chapter.id;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onChapterChange(chapter.id)}
                  aria-pressed={isSelected}
                  className={`tactile-press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    isSelected
                      ? "border-[#f5a640] bg-[#f5a640]/20 text-[#fff6ed]"
                      : "border-[#f5a640]/20 bg-[#1b120b]/50 text-[#f7e7d4]/75 hover:border-[#f5a640]/45 hover:text-[#fff6ed]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: chapter.accentHex }}
                    aria-hidden="true"
                  />
                  {chapter.title[locale]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Feedback Message */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor="feedback-message"
              className="text-sm font-semibold text-[#fff6ed]"
            >
              {t.messageLabel}{" "}
              <span className="ml-1 rounded-full bg-[#d05c00]/30 px-2 py-0.5 text-[11px] font-medium text-[#ffbf75]">
                {t.messageRequired}
              </span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                message.length > 1850
                  ? "text-[#ff9e3d]"
                  : "text-[#f7e7d4]/55"
              }`}
            >
              {message.length} / 2000
            </span>
          </div>
          <textarea
            id="feedback-message"
            name="message"
            required
            rows={5}
            maxLength={2000}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={activeCategoryCopy.placeholder}
            className="mt-2 w-full resize-y rounded-2xl border border-[#f5a640]/30 bg-[#19110b]/75 px-4 py-3 text-base leading-relaxed text-[#fff6ed] placeholder:text-[#f7e7d4]/42 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/25 focus:outline-none"
          />
        </div>

        {/* 5. Optional Sender & Device Info */}
        <div className="rounded-2xl border border-[#f5a640]/20 bg-[#1b120b]/45 p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold text-[#f7b266]">
              {t.optionalSectionTitle}
            </h3>
            <p className="mt-0.5 text-xs text-[#f7e7d4]/68">
              {t.optionalSectionHint}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="feedback-name"
                className="block text-xs font-medium text-[#f7e7d4]/85"
              >
                {t.nameLabel}
              </label>
              <input
                id="feedback-name"
                name="name"
                type="text"
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="mt-1.5 w-full rounded-xl border border-[#f5a640]/25 bg-[#19110b]/75 px-3.5 py-2.5 text-base text-[#fff6ed] placeholder:text-[#f7e7d4]/38 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="feedback-email"
                className="block text-xs font-medium text-[#f7e7d4]/85"
              >
                {t.emailLabel}
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                inputMode="email"
                maxLength={160}
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="mt-1.5 w-full rounded-xl border border-[#f5a640]/25 bg-[#19110b]/75 px-3.5 py-2.5 text-base text-[#fff6ed] placeholder:text-[#f7e7d4]/38 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="feedback-device"
                className="block text-xs font-medium text-[#f7e7d4]/85"
              >
                {t.deviceLabel}
              </label>
              <input
                id="feedback-device"
                name="deviceInfo"
                type="text"
                maxLength={120}
                value={deviceInfo}
                onChange={(e) => setDeviceInfo(e.target.value)}
                placeholder={t.devicePlaceholder}
                className="mt-1.5 w-full rounded-xl border border-[#f5a640]/25 bg-[#19110b]/75 px-3.5 py-2.5 text-base text-[#fff6ed] placeholder:text-[#f7e7d4]/38 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="feedback-version"
                className="block text-xs font-medium text-[#f7e7d4]/85"
              >
                {t.versionLabel}
              </label>
              <input
                id="feedback-version"
                name="appVersion"
                type="text"
                maxLength={40}
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                placeholder={t.versionPlaceholder}
                className="mt-1.5 w-full rounded-xl border border-[#f5a640]/25 bg-[#19110b]/75 px-3.5 py-2.5 text-base text-[#fff6ed] placeholder:text-[#f7e7d4]/38 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error banner */}
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-[#ff8b5e]/50 bg-[#521e11]/70 px-4 py-3 text-sm text-[#ffe3d6]"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9e74]"
              aria-hidden="true"
            />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Capsule CTA Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bebaduy-capsule-btn flex min-h-[52px] w-full items-center justify-center gap-2 px-6 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t.submittingButton}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                {t.submitButton}
              </>
            )}
          </button>
        </div>
      </form>
    </HumaGlassCard>
  );
}
