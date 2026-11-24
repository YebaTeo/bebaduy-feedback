import type {
  CreateFeedbackInput,
  FeedbackItem,
  UpdateFeedbackInput,
} from "../types";
import { JsonFeedbackStore } from "./json-store";
import { SupabaseFeedbackStore } from "./supabase-store";

export interface FeedbackStore {
  readonly driverName: "local-json" | "supabase";
  list(): Promise<FeedbackItem[]>;
  getById(id: string): Promise<FeedbackItem | null>;
  create(input: CreateFeedbackInput): Promise<FeedbackItem>;
  update(id: string, patch: UpdateFeedbackInput): Promise<FeedbackItem | null>;
  delete(id: string): Promise<boolean>;
}

let cachedStore: FeedbackStore | null = null;

export function getFeedbackStore(): FeedbackStore {
  if (cachedStore) {
    return cachedStore;
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  // Prefer modern server-side Secret API Key (`sb_secret_*`), with fallback to legacy `service_role`.
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (supabaseUrl && supabaseKey) {
    cachedStore = new SupabaseFeedbackStore(supabaseUrl, supabaseKey);
  } else {
    cachedStore = new JsonFeedbackStore();
  }

  return cachedStore;
}
