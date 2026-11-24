import { z } from "zod";
import {
  BEBADUY_CHAPTERS,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from "./types";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

export const createFeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  category: z.enum(FEEDBACK_CATEGORIES),
  chapter: z.enum(BEBADUY_CHAPTERS).default("general"),
  message: z.string().trim().min(5).max(2000),
  name: optionalTrimmedString(80),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Invalid email address"
    ),
  deviceInfo: optionalTrimmedString(120),
  appVersion: optionalTrimmedString(40),
  locale: z.enum(["id", "en"]).default("id"),
  // Anti-spam honeypot field — real visitors leave this empty.
  website: z.string().max(200).optional(),
});

export const updateFeedbackSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUSES).optional(),
    adminNote: z
      .string()
      .trim()
      .max(1500)
      .optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.adminNote !== undefined,
    "At least one field must be provided"
  );

export const loginSchema = z.object({
  password: z.string().min(1).max(256),
});
