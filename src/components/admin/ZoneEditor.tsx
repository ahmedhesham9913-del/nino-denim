"use client";

import { useState } from "react";
import type { FirestoreDeliveryZone } from "@/services/delivery-zones";
import GovernorateMultiSelect from "@/components/admin/GovernorateMultiSelect";

interface ZoneEditorProps {
  zones: FirestoreDeliveryZone[];
  onAdd: (zone: { name: string; fee: number; governorates?: string[] }) => Promise<void>;
  onEdit: (
    id: string,
    data: { name?: string; fee?: number; governorates?: string[] }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface ZoneCardState {
  name: string;
  fee: number;
  governorates: string[];
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  confirmDelete: boolean;
}

export default function ZoneEditor({
  zones,
  onAdd,
  onEdit,
  onDelete,
}: ZoneEditorProps) {
  const [cardStates, setCardStates] = useState<Record<string, ZoneCardState>>(
    {}
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState<number>(0);
  const [newGovernorates, setNewGovernorates] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  function getCardState(zone: FirestoreDeliveryZone): ZoneCardState {
    return (
      cardStates[zone.id] ?? {
        name: zone.name,
        fee: zone.fee,
        governorates: zone.governorates ?? [],
        editing: false,
        saving: false,
        deleting: false,
        confirmDelete: false,
      }
    );
  }

  function updateCardState(id: string, patch: Partial<ZoneCardState>) {
    setCardStates((prev) => ({
      ...prev,
      [id]: { ...getCardStateById(id), ...prev[id], ...patch },
    }));
  }

  function getCardStateById(id: string): ZoneCardState {
    const zone = zones.find((z) => z.id === id);
    return (
      cardStates[id] ?? {
        name: zone?.name ?? "",
        fee: zone?.fee ?? 0,
        governorates: zone?.governorates ?? [],
        editing: false,
        saving: false,
        deleting: false,
        confirmDelete: false,
      }
    );
  }

  /** Collect governorates used by all zones EXCEPT the one with excludeId */
  function getDisabledGovernorates(excludeId: string): string[] {
    const disabled: string[] = [];
    for (const zone of zones) {
      if (zone.id === excludeId) continue;
      const state = getCardState(zone);
      disabled.push(...state.governorates);
    }
    return disabled;
  }

  /** Build a map of governorate -> zone name for disabled tooltip */
  function getDisabledOwnerMap(excludeId: string): Record<string, string> {
    const map: Record<string, string> = {};
    for (const zone of zones) {
      if (zone.id === excludeId) continue;
      const state = getCardState(zone);
      for (const gov of state.governorates) {
        map[gov] = state.name || zone.name;
      }
    }
    return map;
  }

  /** Disabled governorates for the add-new form (all zones count) */
  function getDisabledForNew(): string[] {
    const disabled: string[] = [];
    for (const zone of zones) {
      const state = getCardState(zone);
      disabled.push(...state.governorates);
    }
    return disabled;
  }

  function getOwnerMapForNew(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const zone of zones) {
      const state = getCardState(zone);
      for (const gov of state.governorates) {
        map[gov] = state.name || zone.name;
      }
    }
    return map;
  }

  function handleFieldChange(
    id: string,
    zone: FirestoreDeliveryZone,
    field: "name" | "fee" | "governorates",
    value: string | number | string[]
  ) {
    const current = getCardState(zone);
    updateCardState(id, {
      ...current,
      [field]: value,
      editing: true,
    });
  }

  async function handleSave(zone: FirestoreDeliveryZone) {
    const state = getCardState(zone);
    updateCardState(zone.id, { saving: true });
    try {
      await onEdit(zone.id, {
        name: state.name,
        fee: state.fee,
        governorates: state.governorates,
      });
      updateCardState(zone.id, { editing: false, saving: false });
    } catch {
      updateCardState(zone.id, { saving: false });
    }
  }

  async function handleDelete(zone: FirestoreDeliveryZone) {
    const state = getCardState(zone);
    if (!state.confirmDelete) {
      updateCardState(zone.id, { confirmDelete: true });
      return;
    }
    updateCardState(zone.id, { deleting: true });
    try {
      await onDelete(zone.id);
      setCardStates((prev) => {
        const next = { ...prev };
        delete next[zone.id];
        return next;
      });
    } catch {
      updateCardState(zone.id, { deleting: false, confirmDelete: false });
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await onAdd({
        name: newName.trim(),
        fee: newFee,
        governorates: newGovernorates,
      });
      setNewName("");
      setNewFee(0);
      setNewGovernorates([]);
      setShowAddForm(false);
    } catch {
      // keep form open on error
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      {zones.map((zone) => {
        const state = getCardState(zone);
        const disabledGovs = getDisabledGovernorates(zone.id);
        const ownerMap = getDisabledOwnerMap(zone.id);

        return (
          <div
            key={zone.id}
            className="rounded-xl border border-nino-200/20 bg-white p-4"
          >
            <div className="flex flex-col gap-3">
              {/* Name + Fee row */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                      Zone Name
                    </label>
                    <input
                      type="text"
                      value={state.name}
                      onChange={(e) =>
                        handleFieldChange(zone.id, zone, "name", e.target.value)
                      }
                      className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                      Fee (EGP)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={state.fee}
                      onChange={(e) =>
                        handleFieldChange(
                          zone.id,
                          zone,
                          "fee",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {state.editing && (
                    <button
                      type="button"
                      onClick={() => handleSave(zone)}
                      disabled={state.saving}
                      className="rounded-lg bg-nino-950 px-4 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {state.saving ? "Saving..." : "Save"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(zone)}
                    disabled={state.deleting}
                    className={`rounded-lg px-4 py-2 text-xs font-display font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      state.confirmDelete
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "border border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {state.deleting
                      ? "Deleting..."
                      : state.confirmDelete
                      ? "Confirm Delete"
                      : "Delete"}
                  </button>
                  {state.confirmDelete && !state.deleting && (
                    <button
                      type="button"
                      onClick={() =>
                        updateCardState(zone.id, { confirmDelete: false })
                      }
                      className="rounded-lg border border-nino-200/20 px-3 py-2 text-xs font-display font-medium text-nino-800/60 hover:bg-nino-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Governorates selector */}
              <div>
                <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                  Governorates
                </label>
                <GovernorateMultiSelect
                  selected={state.governorates}
                  disabled={disabledGovs}
                  disabledOwnerMap={ownerMap}
                  onChange={(govs) =>
                    handleFieldChange(zone.id, zone, "governorates", govs)
                  }
                />
              </div>

              {/* Governorate chips */}
              {state.governorates.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {state.governorates.map((gov) => (
                    <span
                      key={gov}
                      className="inline-flex items-center gap-1 rounded-full bg-nino-100/60 px-2.5 py-1 text-[11px] font-display font-medium text-nino-700"
                    >
                      {gov}
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(
                            zone.id,
                            zone,
                            "governorates",
                            state.governorates.filter((g) => g !== gov)
                          )
                        }
                        className="ml-0.5 text-nino-400 hover:text-nino-700 transition-colors"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Zone Form */}
      {showAddForm ? (
        <div className="rounded-xl border border-nino-200/20 border-dashed bg-white p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                    Zone Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Cairo"
                    className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 placeholder:text-nino-300 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                    Fee (EGP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newFee}
                    onChange={(e) =>
                      setNewFee(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 placeholder:text-nino-300 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding || !newName.trim()}
                  className="rounded-lg bg-nino-950 px-4 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {adding ? "Adding..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewFee(0);
                    setNewGovernorates([]);
                  }}
                  className="rounded-lg border border-nino-200/20 px-3 py-2 text-xs font-display font-medium text-nino-800/60 hover:bg-nino-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Governorates for new zone */}
            <div>
              <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                Governorates
              </label>
              <GovernorateMultiSelect
                selected={newGovernorates}
                disabled={getDisabledForNew()}
                disabledOwnerMap={getOwnerMapForNew()}
                onChange={setNewGovernorates}
              />
            </div>

            {/* New zone governorate chips */}
            {newGovernorates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {newGovernorates.map((gov) => (
                  <span
                    key={gov}
                    className="inline-flex items-center gap-1 rounded-full bg-nino-100/60 px-2.5 py-1 text-[11px] font-display font-medium text-nino-700"
                  >
                    {gov}
                    <button
                      type="button"
                      onClick={() =>
                        setNewGovernorates((prev) =>
                          prev.filter((g) => g !== gov)
                        )
                      }
                      className="ml-0.5 text-nino-400 hover:text-nino-700 transition-colors"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-xl border border-nino-200/20 border-dashed bg-white py-3 text-sm font-display font-medium text-nino-600 transition-colors hover:bg-nino-50/50 hover:text-nino-800"
        >
          + Add Zone
        </button>
      )}
    </div>
  );
}
