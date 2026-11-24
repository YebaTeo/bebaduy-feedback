import { NextRequest, NextResponse } from "next/server";
import { isInboxAuthenticated } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getFeedbackStore } from "@/lib/storage";
import { createFeedbackSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function GET() {
  const authenticated = await isInboxAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = getFeedbackStore();
    const items = await store.list();
    return NextResponse.json({
      items,
      storageDriver: store.driverName,
    });
  } catch (error) {
    console.error("Failed to list feedback:", error);
    return NextResponse.json(
      { error: "Unable to load feedback right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`feedback:${ip}`, 12, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const parsed = createFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { website, ...input } = parsed.data;

  // Silently accept honeypot-triggered bot submissions without saving them.
  if (website && website.trim().length > 0) {
    return NextResponse.json(
      {
        ok: true,
        id: "accepted",
        referenceCode: "HUMA-0000",
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }

  try {
    const store = getFeedbackStore();
    const item = await store.create(input);
    return NextResponse.json(
      {
        ok: true,
        id: item.id,
        referenceCode: item.referenceCode,
        createdAt: item.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return NextResponse.json(
      { error: "Unable to store feedback right now." },
      { status: 500 }
    );
  }
}
