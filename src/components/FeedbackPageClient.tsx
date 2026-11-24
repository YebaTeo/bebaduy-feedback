"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, CheckCircle2, ShieldCheck, Sprout } from "lucide-react";
import { CHAPTER_CATALOG, COPY, LOCALE_STORAGE_KEY } from "@/lib/i18n";
import type { BeBaduyChapter, Locale } from "@/lib/types";
import { BeBaduyHeader } from "./BeBaduyHeader";
import { FeedbackForm } from "./FeedbackForm";

export function FeedbackPageClient() {
  const [locale, setLocale] = useState<Locale>("id");
  const [selectedChapter, setSelectedChapter] =
    useState<BeBaduyChapter>("general");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === "id" || saved === "en") {
        setLocale(saved);
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  function handleLocaleChange(next: Locale) {
    setLocale(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore storage access restrictions
    }
  }

  function handleSelectChapterFromGuide(chapter: BeBaduyChapter) {
    setSelectedChapter(chapter);
    const formEl = document.getElementById("feedback-form");
    if (formEl && window.innerWidth < 1024) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const t = COPY[locale];

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#1e140d]">
      <BeBaduyHeader
        locale={locale}
        onLocaleChange={handleLocaleChange}
        activePage="feedback"
        tone="light"
      />

      {/* Sunlit Morning Kanekes Hero (mirrors LaunchSplashView -> LandingToMenuTransition) */}
      <section className="relative isolate overflow-hidden bg-[#d8c3b6] text-[#3c4313]">
        {/* Warm misty sky texture */}
        <img
          src="/brand/splash-sky.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom opacity-95"
        />

        {/* Sunlit morning radial haze */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 34%, rgba(255, 246, 226, 0.90) 0%, rgba(255, 244, 218, 0.45) 38%, rgba(204, 176, 161, 0.12) 72%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-12 pb-28 text-center sm:px-6 sm:pt-16 sm:pb-36">
          <div className="animate-huma-enter inline-flex flex-col items-center">
            {/* Glowing BeBaduy Rice Emblem */}
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#fff5de]/85 blur-xl"
              />
              <img
                src="/brand/rice-emblem.png"
                alt="BeBaduy Pare Huma Emblem"
                className="relative h-16 w-16 object-contain drop-shadow-[0_6px_18px_rgba(243,142,26,0.32)] sm:h-20 sm:w-20"
              />
            </div>

            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#5b651d]/20 bg-[#fff6ed]/72 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#4c5519] shadow-xs backdrop-blur-xs">
              <Sprout className="h-3.5 w-3.5 text-[#5b651d]" aria-hidden="true" />
              {t.heroEyebrow}
            </p>

            <h1 className="font-rounded mt-4 max-w-2xl text-3xl leading-[1.15] font-extrabold tracking-tight text-[#434b15] sm:text-5xl">
              {t.heroTitle}
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed font-medium text-[#4f3b2a]/90 sm:text-lg">
              {t.heroBody}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#feedback-form"
                className="bebaduy-capsule-btn inline-flex min-h-12 items-center gap-2 px-7 text-sm font-semibold sm:text-[15px]"
              >
                {t.heroCta}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#4e561b]/90">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ed]/55 px-2.5 py-1 backdrop-blur-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5b651d]" />
                {t.heroBadgeOffline}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ed]/55 px-2.5 py-1 backdrop-blur-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5b651d]" />
                {t.heroBadgePrivacy}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ed]/55 px-2.5 py-1 backdrop-blur-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5b651d]" />
                {t.heroBadgeChapters}
              </span>
            </div>
          </div>
        </div>

        {/* Iconic BeBaduy olive hills transition wave */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden leading-none"
        >
          <img
            src="/brand/splash-waves.png"
            alt=""
            className="block h-24 w-full object-cover object-bottom sm:h-36 md:h-44"
          />
        </div>
      </section>

      {/* Main Earthy Valley Stage + Woven-Glass Huma Form */}
      <main
        id="feedback-form"
        className="relative isolate flex-1 scroll-mt-16 overflow-hidden bg-[#1e140d] pb-16 sm:pb-24"
      >
        {/* Atmospheric Kanekes Valley Backdrop (HumaSunsetValley) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src="/brand/huma-valley.png"
            alt=""
            className="h-full w-full object-cover object-center opacity-42"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #525729 0%, rgba(58, 56, 28, 0.92) 6%, rgba(44, 30, 20, 0.80) 20%, rgba(34, 23, 15, 0.88) 62%, rgba(30, 20, 13, 0.98) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-8">
            {/* Primary Woven-Glass Feedback Form */}
            <div className="lg:col-span-7">
              <FeedbackForm
                locale={locale}
                selectedChapter={selectedChapter}
                onChapterChange={setSelectedChapter}
              />
            </div>

            {/* Companion Cultural Context & Interactive Chapter Selector */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-5">
              <div className="animate-huma-enter-delay-1 rounded-[24px] border border-[#f5a640]/30 bg-[#251911]/78 p-5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-6">
                <h2 className="font-rounded text-lg font-extrabold text-[#f7b266]">
                  {t.sidebarChaptersTitle}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#f7e7d4]/72">
                  {t.sidebarChaptersHint}
                </p>

                <ul className="mt-4 space-y-2">
                  {CHAPTER_CATALOG.filter((c) => c.id !== "general").map(
                    (chapter) => {
                      const isActive = selectedChapter === chapter.id;
                      return (
                        <li key={chapter.id}>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectChapterFromGuide(chapter.id)
                            }
                            className={`tactile-press flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left ${
                              isActive
                                ? "border-[#ff9e3d]/80 bg-[#d05c00]/22 text-[#fff6ed]"
                                : "border-[#f5a640]/14 bg-[#19110b]/55 text-[#f7e7d4]/82 hover:border-[#f5a640]/40 hover:bg-[#22170f]"
                            }`}
                          >
                            <span
                              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-[#fff6ed]/15"
                              style={{ backgroundColor: chapter.accentHex }}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="font-rounded text-sm font-bold text-[#fff6ed]">
                                  {chapter.title[locale]}
                                </span>
                                <span className="text-[10px] font-bold tracking-wider text-[#f7b266]/75">
                                  {chapter.code}
                                </span>
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-[#f7e7d4]/68">
                                {chapter.subtitle[locale]}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>

              <div className="animate-huma-enter-delay-2 rounded-[24px] border border-[#94c796]/25 bg-[#1e271c]/75 p-5 backdrop-blur-md sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#94c796]/35 bg-[#305e40]/45 text-[#94c796]">
                    <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-rounded text-base font-bold text-[#e3f5e4]">
                      {t.sidebarPrivacyTitle}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#d7e8d8]/78">
                      {t.sidebarPrivacyBody}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Subtle Earthy Footer */}
      <footer
        className="border-t border-[#f5a640]/15 bg-[#170f09] text-[#f7e7d4]/65"
        style={{
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 pt-5 text-center text-xs sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <img
              src="/brand/rice-emblem.png"
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain opacity-85"
            />
            <span>{t.footerLine}</span>
          </div>
          <Link
            href="/inbox"
            className="text-[#f7b266]/80 underline-offset-4 transition-colors duration-150 hover:text-[#f7b266] hover:underline"
          >
            {t.footerAdmin}
          </Link>
        </div>
      </footer>
    </div>
  );
}
