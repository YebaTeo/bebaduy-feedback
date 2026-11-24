import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  CreateFeedbackInput,
  FeedbackItem,
  UpdateFeedbackInput,
} from "../types";
import type { FeedbackStore } from "./index";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "feedback.json");
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateReferenceCode(existingCodes: Set<string>): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const bytes = crypto.randomBytes(4);
    let suffix = "";
    for (let i = 0; i < 4; i += 1) {
      suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    const candidate = `HUMA-${suffix}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `HUMA-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

let writeQueue: Promise<unknown> = Promise.resolve();

function runSerialized<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => undefined);
  return next;
}

async function readItems(): Promise<FeedbackItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FeedbackItem[]) : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeItemsAtomic(items: FeedbackItem[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempPath = path.join(
    DATA_DIR,
    `feedback.${crypto.randomUUID()}.tmp`
  );
  await fs.writeFile(tempPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, DATA_FILE);
}

export class JsonFeedbackStore implements FeedbackStore {
  readonly driverName = "local-json" as const;

  async list(): Promise<FeedbackItem[]> {
    const items = await readItems();
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getById(id: string): Promise<FeedbackItem | null> {
    const items = await readItems();
    return items.find((item) => item.id === id) ?? null;
  }

  async create(input: CreateFeedbackInput): Promise<FeedbackItem> {
    return runSerialized(async () => {
      const items = await readItems();
      const existingCodes = new Set(items.map((item) => item.referenceCode));
      const now = new Date().toISOString();

      const item: FeedbackItem = {
        id: crypto.randomUUID(),
        referenceCode: generateReferenceCode(existingCodes),
        rating: input.rating,
        category: input.category,
        chapter: input.chapter,
        message: input.message,
        name: input.name,
        email: input.email,
        deviceInfo: input.deviceInfo,
        appVersion: input.appVersion,
        locale: input.locale,
        status: "new",
        createdAt: now,
        updatedAt: now,
      };

      items.unshift(item);
      await writeItemsAtomic(items);
      return item;
    });
  }

  async update(
    id: string,
    patch: UpdateFeedbackInput
  ): Promise<FeedbackItem | null> {
    return runSerialized(async () => {
      const items = await readItems();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }

      const current = items[index];
      const updated: FeedbackItem = {
        ...current,
        status: patch.status ?? current.status,
        adminNote:
          patch.adminNote !== undefined
            ? patch.adminNote.length > 0
              ? patch.adminNote
              : undefined
            : current.adminNote,
        updatedAt: new Date().toISOString(),
      };

      items[index] = updated;
      await writeItemsAtomic(items);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return runSerialized(async () => {
      const items = await readItems();
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) {
        return false;
      }
      await writeItemsAtomic(filtered);
      return true;
    });
  }
}
