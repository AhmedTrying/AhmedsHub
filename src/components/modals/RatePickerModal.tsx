"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { fmtAED } from "@/lib/format";
import { scopeTint } from "@/lib/tints";
import { Pill } from "@/components/Pill";

export function RatePickerModal({
  open,
  onClose,
  estimateId,
}: {
  open: boolean;
  onClose: () => void;
  estimateId: string;
}) {
  const rates = useStore((s) => s.rates);
  const addRatesToEstimate = useStore((s) => s.addRatesToEstimate);
  const { push } = useToast();

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = rates.filter(
    (r) =>
      q === "" ||
      (r.name + r.source + r.category).toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    if (selected.size === 0) {
      push("Pick at least one rate");
      return;
    }
    const count = addRatesToEstimate(estimateId, Array.from(selected));
    push(`Added ${count} item${count === 1 ? "" : "s"} from library`);
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setSelected(new Set());
        onClose();
      }}
      title="Pull from Rate Library"
      subtitle="Add saved rates to this estimate"
      size="lg"
      footer={
        <>
          <span style={{ marginRight: "auto", color: "var(--text-3)", fontSize: 12 }}>
            {selected.size} selected
          </span>
          <button
            className="btn"
            onClick={() => {
              setSelected(new Set());
              onClose();
            }}
          >
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Add selected
          </button>
        </>
      }
    >
      <div className="tb-search" style={{ width: "100%", marginBottom: 10 }}>
        <Search size={14} />
        <input
          placeholder="Search the rate library…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div
        style={{
          maxHeight: 340,
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        {filtered.map((r) => (
          <label
            key={r.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              style={{ width: 16, height: 16 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
              <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>
                {r.source} · {r.unit}
              </div>
            </div>
            <Pill tone={scopeTint[r.category]}>{r.category}</Pill>
            <span
              className="mono"
              style={{ minWidth: 80, textAlign: "right", fontWeight: 500 }}
            >
              {fmtAED(r.rate)}
            </span>
          </label>
        ))}
        {filtered.length === 0 && (
          <div className="empty">No rates match your search.</div>
        )}
      </div>
    </Modal>
  );
}
