"use client";

import { useEffect, useRef, useState } from "react";
import type { Strain } from "@/lib/types";
import { STANDARD_TERPENES } from "@/lib/constants";

interface Props {
  strain: Strain | null;
  onSave: (strain: Strain) => void;
  onClose: () => void;
}

export default function StrainModal({ strain, onSave, onClose }: Props) {
  const isEdit = !!strain;
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(strain?.name ?? "");
  const [thc, setThc] = useState(strain?.thcPercent?.toString() ?? "");
  const [cbd, setCbd] = useState(strain?.cbdPercent?.toString() ?? "");
  const [terpenes, setTerpenes] = useState<[string, string, string]>(
    strain?.dominantTerpenes ?? ["", "", ""]
  );
  const [customFlags, setCustomFlags] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [notes, setNotes] = useState(strain?.notes ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    nameRef.current?.focus();
    // Detect custom terpenes on load
    if (strain) {
      const flags = strain.dominantTerpenes.map(
        (t) => t.trim() !== "" && !STANDARD_TERPENES.includes(t)
      ) as [boolean, boolean, boolean];
      setCustomFlags(flags);
    }
  }, [strain]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): string[] => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("Name is required.");

    const thcNum = parseFloat(thc);
    if (isNaN(thcNum) || thcNum < 0 || thcNum > 40) {
      errs.push("THC% must be a number between 0 and 40.");
    }

    const cbdNum = parseFloat(cbd);
    if (isNaN(cbdNum) || cbdNum < 0 || cbdNum > 40) {
      errs.push("CBD% must be a number between 0 and 40.");
    }

    const filledTerps = terpenes.filter((t) => t.trim() !== "");
    if (filledTerps.length !== 3) {
      errs.push("Exactly 3 terpenes are required.");
    }

    // Check for duplicates
    const unique = new Set(filledTerps.map((t) => t.trim().toLowerCase()));
    if (unique.size !== filledTerps.length) {
      errs.push("Terpenes must be unique.");
    }

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const saved: Strain = {
      id: strain?.id ?? crypto.randomUUID?.() ?? Date.now().toString(),
      name: name.trim(),
      thcPercent: parseFloat(thc),
      cbdPercent: parseFloat(cbd),
      dominantTerpenes: terpenes.map((t) => t.trim()) as [string, string, string],
      notes: notes.trim() || undefined,
      createdAt: strain?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(saved);
  };

  const handleTerpeneChange = (index: 0 | 1 | 2, value: string) => {
    const next = [...terpenes] as [string, string, string];
    next[index] = value;
    setTerpenes(next);

    // Update custom flag
    const flags = [...customFlags] as [boolean, boolean, boolean];
    flags[index] = value.trim() !== "" && !STANDARD_TERPENES.includes(value);
    setCustomFlags(flags);
  };

  const setCustomTerpene = (index: 0 | 1 | 2) => {
    const flags = [...customFlags] as [boolean, boolean, boolean];
    flags[index] = true;
    setCustomFlags(flags);
    const next = [...terpenes] as [string, string, string];
    next[index] = "";
    setTerpenes(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card w-full max-w-lg mx-4 shadow-2xl animate-in">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-base font-display text-bark-100">
            {isEdit ? "Edit Strain" : "New Strain"}
          </h3>
          <button onClick={onClose} className="btn-ghost !p-1 text-bark-400">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-red-300 text-xs">
                  • {err}
                </p>
              ))}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="label">Strain Name *</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Northern Lights"
              className="input-field"
              maxLength={80}
            />
          </div>

          {/* THC / CBD */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">THC % (0–40) *</label>
              <input
                type="number"
                value={thc}
                onChange={(e) => setThc(e.target.value)}
                placeholder="0"
                step="0.1"
                min="0"
                max="40"
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="label">CBD % (0–40) *</label>
              <input
                type="number"
                value={cbd}
                onChange={(e) => setCbd(e.target.value)}
                placeholder="0"
                step="0.1"
                min="0"
                max="40"
                className="input-field font-mono"
              />
            </div>
          </div>

          {/* Terpenes */}
          <div>
            <label className="label">Dominant Terpenes (exactly 3) *</label>
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-bark-500 w-4">{idx + 1}.</span>
                  {customFlags[idx as 0 | 1 | 2] ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={terpenes[idx as 0 | 1 | 2]}
                        onChange={(e) =>
                          handleTerpeneChange(idx as 0 | 1 | 2, e.target.value)
                        }
                        placeholder="Custom terpene name"
                        className="input-field flex-1"
                        maxLength={40}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const flags = [...customFlags] as [boolean, boolean, boolean];
                          flags[idx as 0 | 1 | 2] = false;
                          setCustomFlags(flags);
                          const next = [...terpenes] as [string, string, string];
                          next[idx as 0 | 1 | 2] = "";
                          setTerpenes(next);
                        }}
                        className="btn-ghost text-xs !px-2"
                      >
                        List
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <select
                        value={terpenes[idx as 0 | 1 | 2]}
                        onChange={(e) =>
                          handleTerpeneChange(idx as 0 | 1 | 2, e.target.value)
                        }
                        className="input-field flex-1"
                      >
                        <option value="">Select terpene…</option>
                        {STANDARD_TERPENES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setCustomTerpene(idx as 0 | 1 | 2)}
                        className="btn-ghost text-xs !px-2"
                        title="Enter a custom terpene"
                      >
                        Custom
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {customFlags.some(Boolean) && (
              <p className="text-amber-400/80 text-[10px] mt-1.5">
                ⚠ Custom terpenes may not have effect mappings. The prediction engine will
                note them but cannot score unknown terpenes.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aroma, lineage, personal observations…"
              rows={2}
              className="input-field resize-none"
              maxLength={300}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? "Save Changes" : "Add Strain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
