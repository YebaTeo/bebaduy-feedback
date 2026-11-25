"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  FileJson,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Map,
  RefreshCw,
  Search,
  Smartphone,
  Star,
  StickyNote,
  Trash2,
  User,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CHAPTER_CATALOG,
  COPY,
  LOCALE_STORAGE_KEY,
  STATUS_LABELS,
} from "@/lib/i18n";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type BeBaduyChapter,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackStatus,
  type Locale,
} from "@/lib/types";
import { BeBaduyHeader } from "./BeBaduyHeader";
import { HumaGlassCard } from "./HumaGlassCard";

interface InboxClientProps {
  initialAuthenticated: boolean;
  isConfigured: boolean;
  initialStorageDriver: "local-json" | "supabase";
}

const STATUS_BADGE_STYLES: Record<FeedbackStatus, string> = {
  new: "border-[#d05c00]/30 bg-[#fff1e2] text-[#a94800]",
  reviewed: "border-[#b57c18]/30 bg-[#fdf5df] text-[#7c530c]",
  resolved: "border-[#305e40]/30 bg-[#e8f4ec] text-[#224730]",
  archived: "border-[#735438]/25 bg-[#f1ece6] text-[#5e4733]",
};

function formatDate(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function InboxClient({
  initialAuthenticated,
  isConfigured,
  initialStorageDriver,
}: InboxClientProps) {
  const [locale, setLocale] = useState<Locale>("id");
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [storageDriver, setStorageDriver] = useState(initialStorageDriver);

  // Login gate state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Inbox data state
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(initialAuthenticated);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<
    FeedbackCategory | "all"
  >("all");
  const [chapterFilter, setChapterFilter] = useState<BeBaduyChapter | "all">(
    "all"
  );

  // Per-card UI state
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = (await res.json()) as {
        items?: FeedbackItem[];
        storageDriver?: "local-json" | "supabase";
        error?: string;
      };
      if (!res.ok || !data.items) {
        setLoadError(data.error || "Unable to load feedback.");
        return;
      }
      setItems(data.items);
      if (data.storageDriver) {
        setStorageDriver(data.storageDriver);
      }
      const drafts: Record<string, string> = {};
      for (const item of data.items) {
        drafts[item.id] = item.adminNote ?? "";
      }
      setNoteDrafts(drafts);
    } catch {
      setLoadError("Network error while loading feedback.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      void loadItems();
    }
  }, [authenticated, loadItems]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    if (!password.trim()) return;

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/inbox/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setLoginError(COPY[locale].inboxInvalidPassword);
        return;
      }

      setPassword("");
      setAuthenticated(true);
    } catch {
      setLoginError(COPY[locale].errorGeneric);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/inbox/logout", { method: "POST" });
    setAuthenticated(false);
    setItems([]);
  }

  async function handleStatusChange(id: string, nextStatus: FeedbackStatus) {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { item: FeedbackItem };
      setItems((prev) =>
        prev.map((item) => (item.id === id ? data.item : item))
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleSaveNote(id: string) {
    setSavingNoteId(id);
    try {
      const res = await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: noteDrafts[id] ?? "" }),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { item: FeedbackItem };
      setItems((prev) =>
        prev.map((item) => (item.id === id ? data.item : item))
      );
      setSavedNoteId(id);
      window.setTimeout(() => {
        setSavedNoteId((current) => (current === id ? null : current));
      }, 1800);
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      setItems((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (chapterFilter !== "all" && item.chapter !== chapterFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.referenceCode,
        item.message,
        item.name,
        item.email,
        item.deviceInfo,
        item.appVersion,
        item.adminNote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, statusFilter, categoryFilter, chapterFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const newCount = items.filter((i) => i.status === "new").length;
    const resolvedCount = items.filter((i) => i.status === "resolved").length;
    const avgRating =
      total > 0
        ? (items.reduce((sum, i) => sum + i.rating, 0) / total).toFixed(1)
        : "—";
    return { total, newCount, resolvedCount, avgRating };
  }, [items]);

  const t = COPY[locale];

  // Unauthenticated Passphrase Gate (woven-glass Leuit vault aesthetic)
  if (!authenticated) {
    return (
      <div className="relative flex min-h-[100svh] flex-col bg-[#1e140d]">
        <BeBaduyHeader
          locale={locale}
          onLocaleChange={handleLocaleChange}
          activePage="inbox"
          tone="dark"
        />

        <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <img
              src="/brand/huma-valley.png"
              alt=""
              className="h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e140d]/85 via-[#2a1d13]/72 to-[#170f09]/95" />
          </div>

          <div className="relative z-10 w-full max-w-md">
            <HumaGlassCard
              className="animate-huma-enter"
              contentClassName="px-6 py-8 sm:px-8 sm:py-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5a640]/60 bg-[#d05c00]/22 text-[#f7b266]">
                  <Lock className="h-6 w-6" aria-hidden="true" />
                </div>

                <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-[#f7b266]/85 uppercase">
                  {t.inboxGateEyebrow}
                </p>
                <h1 className="font-rounded mt-1 text-2xl font-extrabold text-[#fff6ed] sm:text-3xl">
                  {t.inboxGateTitle}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#f7e7d4]/78">
                  {t.inboxGateBody}
                </p>
              </div>

              {!isConfigured ? (
                <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-[#ff8b5e]/50 bg-[#521e11]/70 px-4 py-3 text-sm text-[#ffe3d6]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9e74]" />
                  <span>{t.inboxNotConfigured}</span>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="inbox-password"
                      className="block text-xs font-semibold text-[#f7e7d4]/88"
                    >
                      {t.inboxPasswordLabel}
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="inbox-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder={t.inboxPasswordPlaceholder}
                        className="w-full rounded-xl border border-[#f5a640]/35 bg-[#19110b]/80 py-2.5 pr-11 pl-3.5 text-base text-[#fff6ed] placeholder:text-[#f7e7d4]/40 focus:border-[#f5a640] focus:ring-2 focus:ring-[#f5a640]/25 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-[#f7e7d4]/65 hover:text-[#fff6ed]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError ? (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-[#ff8b5e]/50 bg-[#521e11]/70 px-3.5 py-2.5 text-xs text-[#ffe3d6]"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9e74]" />
                      <span>{loginError}</span>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoggingIn || !password.trim()}
                    className="bebaduy-capsule-btn flex min-h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.inboxSigningIn}
                      </>
                    ) : (
                      t.inboxSignIn
                    )}
                  </button>
                </form>
              )}
            </HumaGlassCard>
          </div>
        </main>
      </div>
    );
  }

  const exportQuery =
    statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : "";

  // Authenticated Inbox Dashboard (warm sunlit paper #FAF7F0 for comfortable reading)
  return (
    <div className="flex min-h-[100svh] flex-col bg-[#faf7f0] text-[#2c1e14]">
      <BeBaduyHeader
        locale={locale}
        onLocaleChange={handleLocaleChange}
        activePage="inbox"
        tone="light"
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Top Title + Action Controls */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5b651d]/20 bg-[#efe9dc] px-3 py-1 text-xs font-semibold text-[#4a5317]">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              {storageDriver === "supabase"
                ? t.inboxStorageSupabase
                : t.inboxStorageLocal}
            </div>
            <h1 className="font-rounded mt-2 text-2xl font-extrabold tracking-tight text-[#3d4414] sm:text-3xl">
              {t.inboxTitle}
            </h1>
            <p className="mt-1 text-sm text-[#6b543f]">{t.inboxSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inbox/field"
              className="tactile-press inline-flex items-center gap-1.5 rounded-full border border-[#5b651d]/30 bg-[#edf2df] px-3.5 py-2 text-xs font-semibold text-[#3f4714] hover:bg-[#e1ebce]"
            >
              <Map className="h-3.5 w-3.5" />
              {locale === "id" ? "Peta Suara Huma" : "Field of Voices"}
            </Link>
            <button
              type="button"
              onClick={() => void loadItems()}
              disabled={isLoading}
              className="tactile-press inline-flex items-center gap-1.5 rounded-full border border-[#735438]/25 bg-white px-3.5 py-2 text-xs font-semibold text-[#4e3926] hover:border-[#735438]/50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              {t.inboxRefresh}
            </button>

            <a
              href={`/api/inbox/export?format=csv${exportQuery}`}
              className="tactile-press inline-flex items-center gap-1.5 rounded-full border border-[#305e40]/30 bg-[#eaf4ed] px-3.5 py-2 text-xs font-semibold text-[#234830] hover:bg-[#dceee1]"
            >
              <Download className="h-3.5 w-3.5" />
              {t.inboxExportCsv}
            </a>

            <a
              href={`/api/inbox/export?format=json${exportQuery}`}
              className="tactile-press inline-flex items-center gap-1.5 rounded-full border border-[#735438]/25 bg-white px-3.5 py-2 text-xs font-semibold text-[#4e3926] hover:border-[#735438]/50"
            >
              <FileJson className="h-3.5 w-3.5" />
              {t.inboxExportJson}
            </a>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="tactile-press inline-flex items-center gap-1.5 rounded-full border border-[#a94800]/25 bg-[#fff3e8] px-3.5 py-2 text-xs font-semibold text-[#a94800] hover:bg-[#ffe7d1]"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.inboxSignOut}
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-[#e3d7c8] bg-white p-4 shadow-2xs">
            <p className="text-xs font-semibold text-[#7b624b]">
              {t.inboxStatTotal}
            </p>
            <p className="font-rounded mt-1 text-2xl font-extrabold text-[#2c1e14] tabular-nums">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f2d0b0] bg-[#fffaf3] p-4 shadow-2xs">
            <p className="text-xs font-semibold text-[#a94800]">
              {t.inboxStatNew}
            </p>
            <p className="font-rounded mt-1 text-2xl font-extrabold text-[#d05c00] tabular-nums">
              {stats.newCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#cde0d3] bg-[#f6fbf7] p-4 shadow-2xs">
            <p className="text-xs font-semibold text-[#305e40]">
              {t.inboxStatResolved}
            </p>
            <p className="font-rounded mt-1 text-2xl font-extrabold text-[#224730] tabular-nums">
              {stats.resolvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#ebd7b5] bg-[#fffcf5] p-4 shadow-2xs">
            <p className="text-xs font-semibold text-[#8c6118]">
              {t.inboxStatRating}
            </p>
            <p className="font-rounded mt-1 inline-flex items-center gap-1.5 text-2xl font-extrabold text-[#5c3e0b] tabular-nums">
              <Star className="h-5 w-5 fill-[#f5a640] text-[#e08c1b]" />
              {stats.avgRating}
            </p>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="mt-6 rounded-2xl border border-[#e3d7c8] bg-white p-3.5 shadow-2xs sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8c735b]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.inboxSearchPlaceholder}
                className="w-full rounded-xl border border-[#dfd2c3] bg-[#faf7f0] py-2 pr-3 pl-9.5 text-base text-[#2c1e14] placeholder:text-[#967f69] focus:border-[#d05c00] focus:bg-white focus:ring-2 focus:ring-[#d05c00]/15 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:col-span-7">
              <select
                aria-label="Filter status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as FeedbackStatus | "all")
                }
                className="rounded-xl border border-[#dfd2c3] bg-[#faf7f0] px-3 py-2 text-base text-[#2c1e14] focus:border-[#d05c00] focus:bg-white focus:outline-none"
              >
                <option value="all">{t.inboxAllStatuses}</option>
                {FEEDBACK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status][locale]}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter category"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as FeedbackCategory | "all")
                }
                className="rounded-xl border border-[#dfd2c3] bg-[#faf7f0] px-3 py-2 text-base text-[#2c1e14] focus:border-[#d05c00] focus:bg-white focus:outline-none"
              >
                <option value="all">{t.inboxAllCategories}</option>
                {FEEDBACK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category][locale].label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter chapter"
                value={chapterFilter}
                onChange={(e) =>
                  setChapterFilter(e.target.value as BeBaduyChapter | "all")
                }
                className="rounded-xl border border-[#dfd2c3] bg-[#faf7f0] px-3 py-2 text-base text-[#2c1e14] focus:border-[#d05c00] focus:bg-white focus:outline-none"
              >
                <option value="all">{t.inboxAllChapters}</option>
                {CHAPTER_CATALOG.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title[locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Feedback List */}
        <section className="mt-6 space-y-4">
          {loadError ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#d05c00]/35 bg-[#fff2e6] p-4 text-sm text-[#9c4200]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          ) : null}

          {isLoading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e3d7c8] bg-white py-16 text-[#7b624b]">
              <Loader2 className="h-6 w-6 animate-spin text-[#d05c00]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d8c8b6] bg-white/75 px-6 py-16 text-center">
              <img
                src="/brand/rice-emblem.png"
                alt=""
                aria-hidden="true"
                className="mx-auto h-12 w-12 object-contain opacity-65"
              />
              <h2 className="font-rounded mt-3 text-lg font-bold text-[#434b15]">
                {t.inboxEmptyTitle}
              </h2>
              <p className="mt-1 text-sm text-[#78604a]">{t.inboxEmptyBody}</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const chapterMeta =
                CHAPTER_CATALOG.find((c) => c.id === item.chapter) ??
                CHAPTER_CATALOG[0];
              const noteDraft = noteDrafts[item.id] ?? "";
              const noteChanged = noteDraft !== (item.adminNote ?? "");

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-[#e3d7c8] bg-white p-5 shadow-2xs transition-colors duration-150 sm:p-6"
                >
                  {/* Top Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-rounded rounded-full bg-[#2c1e14] px-2.5 py-0.5 text-xs font-bold tracking-wider text-[#f7b266]">
                        {item.referenceCode}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-[#ebd7b5] bg-[#fff9ec] px-2.5 py-0.5 text-xs font-bold text-[#8a5d10]">
                        <Star className="h-3.5 w-3.5 fill-[#f5a640] text-[#e08c1b]" />
                        {item.rating}/5
                      </span>

                      <span className="rounded-full border border-[#e2d6c7] bg-[#faf7f0] px-2.5 py-0.5 text-xs font-semibold text-[#5a4431]">
                        {CATEGORY_LABELS[item.category][locale].label}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2d6c7] bg-[#faf7f0] px-2.5 py-0.5 text-xs font-semibold text-[#5a4431]">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: chapterMeta.accentHex }}
                        />
                        {chapterMeta.title[locale]}
                      </span>

                      <span className="text-xs text-[#8a725c]">
                        {formatDate(item.createdAt, locale)}
                      </span>
                    </div>

                    {/* Inline Status Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Status for ${item.referenceCode}`}
                        disabled={updatingStatusId === item.id}
                        value={item.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            item.id,
                            e.target.value as FeedbackStatus
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-bold focus:outline-none ${STATUS_BADGE_STYLES[item.status]}`}
                      >
                        {FEEDBACK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status][locale]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Body (selectable content) */}
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[#2c1e14]">
                    {item.message}
                  </p>

                  {/* Sender & Device Metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#efe6db] pt-3.5 text-xs text-[#6d5540]">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 text-[#9a7e64]" />
                      {item.name || t.inboxAnonymous}
                    </span>

                    {item.email ? (
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          `BeBaduy Feedback (${item.referenceCode})`
                        )}`}
                        className="inline-flex items-center gap-1.5 font-medium text-[#b85100] hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {item.email}
                      </a>
                    ) : null}

                    {item.deviceInfo || item.appVersion ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-[#9a7e64]" />
                        {[item.deviceInfo, item.appVersion]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </div>

                  {/* Maintainer Note + Safe Delete */}
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#faf7f0] p-3.5 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label
                        htmlFor={`note-${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b533e]"
                      >
                        <StickyNote className="h-3.5 w-3.5 text-[#b57c18]" />
                        {t.inboxNoteLabel}
                      </label>
                      <input
                        id={`note-${item.id}`}
                        type="text"
                        maxLength={1500}
                        value={noteDraft}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder={t.inboxNotePlaceholder}
                        className="mt-1.5 w-full rounded-xl border border-[#e0d4c6] bg-white px-3 py-2 text-base text-[#2c1e14] placeholder:text-[#9c8671] focus:border-[#d05c00] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={!noteChanged || savingNoteId === item.id}
                        onClick={() => void handleSaveNote(item.id)}
                        className={`tactile-press inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold disabled:cursor-not-allowed ${
                          savedNoteId === item.id
                            ? "bg-[#305e40] text-[#fff6ed]"
                            : noteChanged
                              ? "bg-[#5b651d] text-[#fff6ed]"
                              : "border border-[#d8ccb8] bg-[#f1eae0] text-[#6d5945]"
                        }`}
                      >
                        {savingNoteId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : savedNoteId === item.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : null}
                        {savedNoteId === item.id
                          ? t.inboxSavedNote
                          : t.inboxSaveNote}
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => void handleDelete(item.id)}
                            className="tactile-press inline-flex items-center gap-1 rounded-full bg-[#b42318] px-3 py-2 text-xs font-semibold text-white"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            {t.inboxConfirmDelete}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="tactile-press rounded-full border border-[#d6c8b9] bg-white px-3 py-2 text-xs font-semibold text-[#5f4a37]"
                          >
                            {t.inboxCancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          aria-label={`${t.inboxDelete} ${item.referenceCode}`}
                          className="tactile-press inline-flex items-center gap-1 rounded-full border border-[#e3c8c0] bg-white px-3 py-2 text-xs font-semibold text-[#9a2e22] hover:bg-[#fff2f0]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.inboxDelete}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
