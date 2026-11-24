export type Locale = "id" | "en";

export const FEEDBACK_CATEGORIES = [
  "bug",
  "feature",
  "culture",
  "interaction",
  "appreciation",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const BEBADUY_CHAPTERS = [
  "general",
  "narawas",
  "ngaseuk",
  "ngored",
  "mipit",
  "ngalantai",
  "ngaleuitkeun",
  "koleksi",
] as const;

export type BeBaduyChapter = (typeof BEBADUY_CHAPTERS)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "reviewed",
  "resolved",
  "archived",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface FeedbackItem {
  id: string;
  referenceCode: string;
  rating: number;
  category: FeedbackCategory;
  chapter: BeBaduyChapter;
  message: string;
  name?: string;
  email?: string;
  deviceInfo?: string;
  appVersion?: string;
  locale: Locale;
  status: FeedbackStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackInput {
  rating: number;
  category: FeedbackCategory;
  chapter: BeBaduyChapter;
  message: string;
  name?: string;
  email?: string;
  deviceInfo?: string;
  appVersion?: string;
  locale: Locale;
}

export interface UpdateFeedbackInput {
  status?: FeedbackStatus;
  adminNote?: string;
}
