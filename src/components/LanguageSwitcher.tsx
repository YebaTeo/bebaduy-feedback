"use client";

import type { Locale } from "@/lib/types";

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (next: Locale) => void;
  tone?: "light" | "dark";
}

export function LanguageSwitcher({
  locale,
  onChange,
  tone = "light",
}: LanguageSwitcherProps) {
  const isLight = tone === "light";

  return (
    <div
      role="group"
      aria-label="Language"
      className={`relative inline-grid grid-cols-2 items-center rounded-full border p-0.5 text-xs font-semibold ${
        isLight
          ? "border-[#5b651d]/20 bg-[#fff6ed]/70 text-[#4c5519]"
          : "border-[#f5a640]/35 bg-[#231810]/80 text-[#f7e7d4]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0.5 left-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isLight ? "bg-[#5b651d]" : "bg-[#d05c00]"
        }`}
        style={{
          transform: locale === "en" ? "translateX(100%)" : "translateX(0%)",
        }}
      />
      <button
        type="button"
        onClick={() => onChange("id")}
        aria-pressed={locale === "id"}
        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
          locale === "id"
            ? "text-[#fff6ed]"
            : isLight
              ? "text-[#4c5519]/80 hover:text-[#3f4714]"
              : "text-[#f7e7d4]/75 hover:text-[#fff6ed]"
        }`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={locale === "en"}
        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
          locale === "en"
            ? "text-[#fff6ed]"
            : isLight
              ? "text-[#4c5519]/80 hover:text-[#3f4714]"
              : "text-[#f7e7d4]/75 hover:text-[#fff6ed]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
