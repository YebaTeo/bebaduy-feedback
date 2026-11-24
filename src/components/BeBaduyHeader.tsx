"use client";

import Link from "next/link";
import { Inbox, MessageSquareHeart } from "lucide-react";
import { COPY } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface BeBaduyHeaderProps {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  activePage: "feedback" | "inbox";
  tone?: "light" | "dark";
}

export function BeBaduyHeader({
  locale,
  onLocaleChange,
  activePage,
  tone = "light",
}: BeBaduyHeaderProps) {
  const t = COPY[locale];
  const isLight = tone === "light";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        isLight
          ? "border-[#5b651d]/12 bg-[#e8d9ce]/78 text-[#3c4313]"
          : "border-[#f5a640]/20 bg-[#1e140d]/82 text-[#fff6ed]"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="tactile-press flex items-center gap-2.5 rounded-full py-1 pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d05c00]"
        >
          <img
            src="/brand/rice-emblem.png"
            alt="BeBaduy"
            className="h-9 w-9 object-contain drop-shadow-[0_2px_6px_rgba(91,101,29,0.22)]"
          />
          <div className="flex items-baseline gap-2">
            <span
              className={`font-rounded text-xl font-extrabold tracking-tight ${
                isLight ? "text-[#5b651d]" : "text-[#fff6ed]"
              }`}
            >
              BeBaduy
            </span>
            <span
              className={`hidden rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide sm:inline-block ${
                isLight
                  ? "bg-[#5b651d]/10 text-[#4a5317]"
                  : "bg-[#f5a640]/15 text-[#f7b266]"
              }`}
            >
              {t.navTag}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {activePage === "feedback" ? (
            <Link
              href="/inbox"
              className={`tactile-press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                isLight
                  ? "border-[#5b651d]/20 bg-[#fff6ed]/65 text-[#464e15] hover:bg-[#fff6ed]"
                  : "border-[#f5a640]/30 bg-[#2d2016]/75 text-[#f7e7d4] hover:border-[#f5a640]/60"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden xs:inline sm:inline">{t.navInbox}</span>
            </Link>
          ) : (
            <Link
              href="/"
              aria-label={t.navFeedback}
              className={`tactile-press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                isLight
                  ? "border-[#5b651d]/20 bg-[#fff6ed]/65 text-[#464e15] hover:bg-[#fff6ed]"
                  : "border-[#f5a640]/30 bg-[#2d2016]/75 text-[#f7e7d4] hover:border-[#f5a640]/60"
              }`}
            >
              <MessageSquareHeart className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.navFeedback}</span>
            </Link>
          )}

          <LanguageSwitcher
            locale={locale}
            onChange={onLocaleChange}
            tone={tone}
          />
        </div>
      </div>
    </header>
  );
}
