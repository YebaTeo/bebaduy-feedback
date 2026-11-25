"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Locale } from "@/lib/types";

export function PlantSeed({ locale, onPlant }: { locale: Locale; onPlant: () => void }) {
  const [depth, setDepth] = useState(0);
  const [held, setHeld] = useState(false);
  const drag = useRef<{ pointer: number; origin: number; travel: number } | null>(null);
  const grain = useRef<HTMLDivElement>(null);
  const id = locale === "id";

  useEffect(() => {
    if (depth < 100) return;
    const timer = window.setTimeout(onPlant, 180);
    return () => window.clearTimeout(timer);
  }, [depth, onPlant]);

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    setHeld(false);
  }

  function moveSeed(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const percent = Math.round((event.clientY - gesture.origin) / gesture.travel * 100);
    const released = event.type === "pointerup";
    const planted = percent >= 80 && (released || event.pointerType === "touch");
    setDepth(planted ? 100 : Math.max(0, Math.min(99, percent)));
    if (planted || released) endDrag(event);
  }

  return <>
    <p id="seed-hint" className="mt-3 text-sm text-[#ecd6ba]">
      {id ? "Geser benih ke bawah sampai masuk ke tanah." : "Slide the seed down into the soil."}
    </p>
    <div className="sowing-bed" role="slider" tabIndex={0}
        aria-label={id ? "Benih padi" : "Rice seed"} aria-describedby="seed-hint" aria-orientation="vertical"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={depth}
        onPointerDown={event => {
          if (drag.current || !event.isPrimary || event.button !== 0 || !grain.current || depth === 100) return;
          const bed = event.currentTarget.getBoundingClientRect();
          const seed = grain.current.getBoundingClientRect();
          const offset = seed.top + seed.height / 2 - bed.top - bed.height * .08;
          drag.current = { pointer: event.pointerId, origin: event.clientY - offset, travel: bed.height * .69 };
          event.currentTarget.setPointerCapture(event.pointerId);
          setHeld(true);
        }}
        onPointerMove={moveSeed}
        onPointerUp={moveSeed}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={e => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          setDepth(value => Math.min(100, Math.max(0, value + (e.key === "ArrowDown" ? 25 : -25))));
        }}>
      <div aria-hidden="true" className="sowing-patch" />
      <div ref={grain} aria-hidden="true" className={held || depth ? "sowing-grip" : "sowing-grip seed-idle"}
        style={{top: (8 + depth * .69) + "%", transform: "translate(-50%, -50%)", opacity: depth === 100 ? 0 : 1, transitionDuration: held ? "0ms" : undefined}}>
        <span className="plant-grain" />
      </div>
    </div>
  </>;
}
