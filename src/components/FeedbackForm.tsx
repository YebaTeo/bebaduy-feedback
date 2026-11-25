"use client";

import { RiceRating } from "./RiceRating";

import { useEffect, useRef, useState } from "react";
import { COPY } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { PlantSeed } from "./PlantSeed";

export function FeedbackForm({ locale }: { locale: Locale }) {
  const id = locale === "id";
  const [stage, setStage] = useState<"ready" | "writing" | "sent">("ready");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const editor = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (stage === "writing") editor.current?.focus({ preventScroll: true });
    if (stage !== "sent") return;
    const timer = window.setTimeout(() => {
      setStage("ready");
      setMessage("");
      setName("");
      setRating(0);
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [stage]);

  async function send() {
    if (pending.current) return;
    if (message.trim().length < 5) {
      setError(COPY[locale].errorMinMessage);
      return;
    }
    if (rating === 0) {
      setError(id ? "Pilih jumlah bulir padi untuk memberi penilaian." : "Choose a rice grain to rate your experience.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), name: name.trim() || undefined, rating, locale }),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error();
      setStage("sent");
    } catch {
      setError(COPY[locale].errorGeneric);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return <section className="planting-stage text-center">
    {stage === "ready" ? <>
      <h1 className="font-rounded text-3xl font-bold text-[#f7b266]">{id ? "Tanam benih masukanmu" : "Plant your feedback seed"}</h1>
      <PlantSeed locale={locale} onPlant={() => setStage("writing")} />
    </> : <>
      <div className={'seed-speech mx-auto max-w-sm text-left ' + (stage === "sent" ? "seed-sent" : "")}>
        {stage === "sent" ? <div role="status">
          <p className="mb-2 font-bold">{id ? "Terima kasih! Masukanmu berhasil dikirim." : "Thank you! Your feedback was sent successfully."}</p>
          <p className="max-h-40 overflow-auto whitespace-pre-wrap break-words">{message}</p>
        </div> : <>
          <label htmlFor="seed-message" className="font-bold">{id ? "Apa yang ingin kamu sampaikan?" : "What would you like to share?"}</label>
          <textarea ref={editor} id="seed-message" rows={3} maxLength={2000} readOnly={busy}
            value={message} onChange={event => setMessage(event.target.value)}
            className="mt-2 mb-4 block w-full resize-none rounded-xl border-2 border-[#94744e] bg-[#fffaf1] px-3 py-2 focus:border-[#75451c] focus:outline-2 focus:outline-offset-2 focus:outline-[#75451c]" />
          <RiceRating value={rating} locale={locale} onChange={value => { setRating(value); setError(""); }} disabled={busy} />
          <label htmlFor="seed-name" className="mt-4 block text-sm">{id ? "Nama (opsional)" : "Name (optional)"}</label>
          <input id="seed-name" name="name" autoComplete="name" maxLength={80}
            readOnly={busy} value={name} onChange={event => setName(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-[#96693055] bg-transparent px-3 py-2" />
          <button type="button" disabled={busy} onClick={send}
            className="bebaduy-capsule-btn mt-4 block w-full rounded-full px-4 py-3 font-bold disabled:opacity-60">
            {busy ? (id ? "Mengirim…" : "Sending…") : (id ? "Kirim" : "Send")}
          </button>
          {error && <p role="alert">{error}</p>}
        </>}
      </div>
      <div aria-hidden="true" className="relative mx-auto mt-5 h-12 w-24 rounded-[50%] bg-[#65442c]"><span className="plant-grain" /></div>
    </>}
  </section>;
}
