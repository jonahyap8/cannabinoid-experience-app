"use client";

import { useState } from "react";
import type { BlendEntry, Strain } from "@/lib/types";
import StrainModal from "./StrainModal";
import TerpeneTooltip from "./TerpeneTooltip";

interface Props {
  strains: Strain[];
  blendEntries: BlendEntry[];
  onSave: (strain: Strain) => void;
  onDelete: (id: string) => void;
  onAddToBlend: (strainId: string) => void;
}

export default function StrainLibrary({
  strains,
  blendEntries,
  onSave,
  onDelete,
  onAddToBlend,
}: Props) {
  const [search, setSearch] = useState("");
  const [editingStrain, setEditingStrain] = useState<Strain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = strains.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const blendIds = new Set(blendEntries.map((e) => e.strainId));
  const blendFull = blendEntries.length >= 3;

  const handleNew = () => {
    setEditingStrain(null);
    setIsModalOpen(true);
  };

  const handleEdit = (strain: Strain) => {
    setEditingStrain(strain);
    setIsModalOpen(true);
  };

  const handleModalSave = (strain: Strain) => {
    onSave(strain);
    setIsModalOpen(false);
    setEditingStrain(null);
  };

  const handleDelete = (strain: Strain) => {
    if (confirm(`Delete "${strain.name}"? This cannot be undone.`)) {
      onDelete(strain.id);
    }
  };

  return (
    <>
      <div className="card flex flex-col" style={{ maxHeight: "calc(100vh - 160px)" }}>
        <div className="card-header flex items-center justify-between gap-3">
          <h2 className="text-base text-bark-100 font-display">Strain Library</h2>
          <button onClick={handleNew} className="btn-primary text-xs !px-3 !py-1.5">
            + New
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-void-700/40">
          <input
            type="text"
            placeholder="Search strains…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-bark-500 text-sm">
                {strains.length === 0
                  ? "No strains yet. Add your first one!"
                  : "No strains match your search."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-void-800/40">
              {filtered.map((strain) => {
                const inBlend = blendIds.has(strain.id);
                return (
                  <li
                    key={strain.id}
                    className="px-4 py-3 hover:bg-void-800/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bark-100 truncate">
                          {strain.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-mono text-ember-400">
                            THC {strain.thcPercent}%
                          </span>
                          <span className="text-[11px] font-mono text-sage-400">
                            CBD {strain.cbdPercent}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {strain.dominantTerpenes.map((t, i) => (
                            <TerpeneTooltip key={i} terpene={t}>
                              <span className="badge-sage text-[10px] !px-1.5 !py-0 cursor-help">
                                {t}
                              </span>
                            </TerpeneTooltip>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => onAddToBlend(strain.id)}
                          disabled={inBlend || blendFull}
                          className="btn-ghost text-[10px] !px-2 !py-0.5"
                          title={
                            inBlend
                              ? "Already in blend"
                              : blendFull
                                ? "Blend full (max 3)"
                                : "Add to blend"
                          }
                        >
                          {inBlend ? "✓" : "+ Blend"}
                        </button>
                        <button
                          onClick={() => handleEdit(strain)}
                          className="btn-ghost text-[10px] !px-2 !py-0.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(strain)}
                          className="btn-ghost text-[10px] !px-2 !py-0.5 !text-red-400 hover:!text-red-300"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-void-700/40">
          <p className="text-[10px] text-bark-600 text-center">
            {strains.length} strain{strains.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isModalOpen && (
        <StrainModal
          strain={editingStrain}
          onSave={handleModalSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStrain(null);
          }}
        />
      )}
    </>
  );
}
