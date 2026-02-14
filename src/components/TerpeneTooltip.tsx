"use client";

import { useState, useRef, useEffect } from "react";
import { TERPENE_INFO } from "@/lib/terpene-info";
import { TERPENE_EFFECT_MAP } from "@/lib/constants";

interface Props {
  terpene: string;
  children: React.ReactNode;
}

export default function TerpeneTooltip({ terpene, children }: Props) {
  const [show, setShow] = useState(false);
  const [above, setAbove] = useState(true);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const info = TERPENE_INFO[terpene];
  const effects = TERPENE_EFFECT_MAP[terpene];

  useEffect(() => {
    if (show && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setAbove(rect.top > 200);
    }
  }, [show]);

  if (!info) return <>{children}</>;

  const topEffects = effects
    ? Object.entries(effects)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag)
    : [];

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 w-56 p-3 rounded-lg bg-void-800 border border-void-600/60 shadow-xl text-left pointer-events-none ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          } left-1/2 -translate-x-1/2`}
        >
          <p className="text-xs font-medium text-bark-100">{info.name}</p>
          <p className="text-[10px] text-sage-400 mt-0.5 italic">{info.aroma}</p>
          <p className="text-[11px] text-bark-300 mt-1.5 leading-relaxed">
            {info.description}
          </p>
          {topEffects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {topEffects.map((tag) => (
                <span key={tag} className="badge-sage text-[9px] !px-1.5 !py-0">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
