import { networkInterfaces } from "node:os";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isInboxAuthenticated } from "@/lib/auth";
import { getFeedbackStore } from "@/lib/storage";
import { FeedbackFieldClient } from "@/components/FeedbackFieldClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BeBaduy · Peta Suara Huma",
  robots: { index: false, follow: false },
};

export default async function FeedbackFieldPage() {
  if (!(await isInboxAuthenticated())) redirect("/inbox");

  const items = await getFeedbackStore().list();
  const interfaces = process.env.NODE_ENV === "development" ? networkInterfaces() : {};
  const localAddress = Object.values(interfaces).flat().find(ip =>
    ip?.family === "IPv4" && !ip.internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip.address)
  )?.address;
  return <FeedbackFieldClient initialItems={items} localAddress={localAddress} />;
}
