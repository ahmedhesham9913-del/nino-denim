"use client";

interface StockEditorProps {
  sizes: string[];
  stock: Record<string, number>;
  onChange: (stock: Record<string, number>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

function stockDot(count: number): string {
  if (count === 0) return "bg-red-500";
  if (count <= 5) return "bg-yellow-500";
  return "bg-green-500";
}

export default function StockEditor({ sizes, stock, onChange, onSave, saving }: StockEditorProps) {
  const totalStock = sizes.reduce((sum, size) => sum + (stock[size] ?? 0), 0);

  function handleChange(size: string, value: number) {
    onChange({ ...stock, [size]: Math.max(0, value) });
  }

  return (
    <div className="space-y-3">
      <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
        Stock by Size
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sizes.map((size) => {
          const count = stock[size] ?? 0;
          return (
            <div
              key={size}
              className="flex items-center gap-3 rounded-lg border border-nino-200/15 bg-white px-3 py-2.5"
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${stockDot(count)}`} />
              <span className="font-display font-semibold text-sm text-nino-950 min-w-[28px]">
                {size}
              </span>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => handleChange(size, parseInt(e.target.value) || 0)}
                className="w-16 rounded-md border border-nino-200/20 bg-nino-50/30 px-2 py-1 text-sm font-body text-nino-800 text-center focus:outline-none focus:ring-2 focus:ring-nino-500/30"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-body text-nino-800/60">
          Total Stock:{" "}
          <span className="font-display font-semibold text-nino-950">{totalStock}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
