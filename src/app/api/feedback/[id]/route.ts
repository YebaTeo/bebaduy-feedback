import { NextRequest, NextResponse } from "next/server";
import { isInboxAuthenticated } from "@/lib/auth";
import { getFeedbackStore } from "@/lib/storage";
import { updateFeedbackSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authenticated = await isInboxAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid feedback id" }, { status: 400 });
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

  const parsed = updateFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const store = getFeedbackStore();
    const updated = await store.update(id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Feedback item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return NextResponse.json(
      { error: "Unable to update feedback." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authenticated = await isInboxAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid feedback id" }, { status: 400 });
  }

  try {
    const store = getFeedbackStore();
    const deleted = await store.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Feedback item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json(
      { error: "Unable to delete feedback." },
      { status: 500 }
    );
  }
}
