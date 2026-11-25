"use client";

import { useEffect, useState } from "react";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { FeedbackForm } from "./FeedbackForm";

export function FeedbackPageClient() {
  const [locale, setLocale] = useState<Locale>("id");
  useEffect(() => {
    try {
      if (localStorage.getItem(LOCALE_STORAGE_KEY) === "en") setLocale("en");
    } catch { /* Use Indonesian when storage is unavailable. */ }
  }, []);
  return <main id="feedback-form" lang={locale} className="planting-clearing">
    <FeedbackForm locale={locale} />
  </main>;
}
