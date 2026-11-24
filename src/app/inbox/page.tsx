import type { Metadata } from "next";
import { isAdminConfigured, isInboxAuthenticated } from "@/lib/auth";
import { getFeedbackStore } from "@/lib/storage";
import { InboxClient } from "@/components/InboxClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BeBaduy · Kotak Masuk Leuit (Inbox)",
  robots: { index: false, follow: false },
};

export default async function InboxPage() {
  const authenticated = await isInboxAuthenticated();
  const store = getFeedbackStore();

  return (
    <InboxClient
      initialAuthenticated={authenticated}
      isConfigured={isAdminConfigured()}
      initialStorageDriver={store.driverName}
    />
  );
}
