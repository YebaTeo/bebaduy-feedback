import { NextResponse } from "next/server";
import { isAdminConfigured, isInboxAuthenticated } from "@/lib/auth";
import { getFeedbackStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isInboxAuthenticated();
  const store = getFeedbackStore();
  return NextResponse.json({
    authenticated,
    configured: isAdminConfigured(),
    storageDriver: store.driverName,
  });
}
