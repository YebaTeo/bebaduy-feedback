"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft } from "lucide-react";
import { FeedbackFieldScene } from "./FeedbackFieldScene";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";
import type { FeedbackItem, Locale } from "@/lib/types";

export function FeedbackFieldClient({ initialItems: items, localAddress }: { initialItems: FeedbackItem[]; localAddress?: string }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [entryUrl, setEntryUrl] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === "id" || saved === "en") setLocale(saved);
    } catch { /* Browser storage may be disabled. */ }
  }, []);

  useEffect(() => {
    const url = new URL("/#feedback-form", window.location.origin);
    if (localAddress && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      url.hostname = localAddress;
    }
    setEntryUrl(url.href);
  }, [localAddress]);

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const cursor = useRef(0);
  useEffect(() => {
    if (!items.length) return;
    const timer = window.setTimeout(() => {
      if (selected) {
        cursor.current = items.indexOf(selected) + 1;
        setSelectedId(null);
      } else {
        setSelectedId(items[cursor.current % items.length].id);
      }
    }, selected ? Math.min(30000, 5000 + selected.message.length * 45) : 3200);
    return () => window.clearTimeout(timer);
  }, [items, selected]);

  return (
    <main className="voice-landscape">
      <section className="field-stage">
        <FeedbackFieldScene items={items} selectedId={selected?.id ?? null} locale={locale} onSelect={setSelectedId} />
        <Link href="/inbox" aria-label={locale === "id" ? "Kembali ke kotak masuk" : "Back to inbox"}
          className="field-control absolute left-4 top-[max(1rem,env(safe-area-inset-top))]">
          <ArrowLeft size={19} />
        </Link>
        {!items.length && <p className="field-empty">{locale === "id" ? "Belum ada benih yang ditanam." : "No seeds have been planted yet."}</p>}
      </section>
      <aside className="field-qr-panel" aria-labelledby="field-invite">
        <div className="field-invite">
          <div className="field-invite-mark" aria-hidden="true"><img src="/brand/rice-emblem.png" alt="" /></div>
          <h2 id="field-invite">{locale === "id" ? "Tanam masukanmu" : "Plant your feedback"}</h2>
          <p>{locale === "id" ? "Pindai dengan kamera HP." : "Scan with your phone camera."}</p>
          <Link className="field-qr" href="/#feedback-form" aria-label={locale === "id" ? "Isi masukan" : "Leave feedback"}>
            <span className="field-code">
              {entryUrl && <QRCodeSVG value={entryUrl} size={384} marginSize={4} level="M" fgColor="#26241c" bgColor="#fffdf6" aria-hidden="true" />}
            </span>
          </Link>
        </div>
      </aside>
    </main>
  );
}
