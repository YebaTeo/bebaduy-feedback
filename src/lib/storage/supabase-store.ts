import crypto from "node:crypto";
import type {
  BeBaduyChapter,
  CreateFeedbackInput,
  FeedbackCategory,
  FeedbackItem,
  FeedbackStatus,
  Locale,
  UpdateFeedbackInput,
} from "../types";
import type { FeedbackStore } from "./index";

interface SupabaseRow {
  id: string;
  reference_code: string;
  rating: number;
  category: FeedbackCategory;
  chapter: BeBaduyChapter;
  message: string;
  name: string | null;
  email: string | null;
  device_info: string | null;
  app_version: string | null;
  locale: Locale;
  status: FeedbackStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateReferenceCode(): string {
  const bytes = crypto.randomBytes(4);
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `HUMA-${suffix}`;
}

function toFeedbackItem(row: SupabaseRow): FeedbackItem {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    rating: row.rating,
    category: row.category,
    chapter: row.chapter,
    message: row.message,
    name: row.name ?? undefined,
    email: row.email ?? undefined,
    deviceInfo: row.device_info ?? undefined,
    appVersion: row.app_version ?? undefined,
    locale: row.locale,
    status: row.status,
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseFeedbackStore implements FeedbackStore {
  readonly driverName = "supabase" as const;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(url: string, apiKey: string) {
    this.baseUrl = `${url.replace(/\/$/, "")}/rest/v1/bebaduy_feedback`;
    this.apiKey = apiKey;
  }

  private headers(extra?: Record<string, string>): HeadersInit {
    const base: Record<string, string> = {
      apikey: this.apiKey,
      "Content-Type": "application/json",
      ...extra,
    };
    // Modern opaque keys (`sb_secret_*`) authenticate via `apikey` alone;
    // legacy JWT `service_role` keys also accept `Authorization: Bearer`.
    if (!this.apiKey.startsWith("sb_")) {
      base.Authorization = `Bearer ${this.apiKey}`;
    }
    return base;
  }

  async list(): Promise<FeedbackItem[]> {
    const res = await fetch(`${this.baseUrl}?select=*&order=created_at.desc`, {
      headers: this.headers(),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Supabase list failed: ${res.status}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    return rows.map(toFeedbackItem);
  }

  async getById(id: string): Promise<FeedbackItem | null> {
    const res = await fetch(
      `${this.baseUrl}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
      {
        headers: this.headers(),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase get failed: ${res.status}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    return rows[0] ? toFeedbackItem(rows[0]) : null;
  }

  async create(input: CreateFeedbackInput): Promise<FeedbackItem> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify({
        reference_code: generateReferenceCode(),
        rating: input.rating,
        category: input.category,
        chapter: input.chapter,
        message: input.message,
        name: input.name ?? null,
        email: input.email ?? null,
        device_info: input.deviceInfo ?? null,
        app_version: input.appVersion ?? null,
        locale: input.locale,
      }),
    });
    if (!res.ok) {
      throw new Error(`Supabase insert failed: ${res.status}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    return toFeedbackItem(rows[0]);
  }

  async update(
    id: string,
    patch: UpdateFeedbackInput
  ): Promise<FeedbackItem | null> {
    const body: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.status !== undefined) {
      body.status = patch.status;
    }
    if (patch.adminNote !== undefined) {
      body.admin_note = patch.adminNote.length > 0 ? patch.adminNote : null;
    }

    const res = await fetch(
      `${this.baseUrl}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: this.headers({ Prefer: "return=representation" }),
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase update failed: ${res.status}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    return rows[0] ? toFeedbackItem(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(
      `${this.baseUrl}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: this.headers({ Prefer: "return=representation" }),
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase delete failed: ${res.status}`);
    }
    const rows = (await res.json()) as SupabaseRow[];
    return rows.length > 0;
  }
}
