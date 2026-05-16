"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Download,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { useToast } from "@/components/Toast";
import { Pill } from "@/components/Pill";
import { fmtAED } from "@/lib/format";
import { scopeTint, scopeOptions } from "@/lib/tints";
import type { Scope } from "@/lib/types";

const RATE_CATS = ["All", ...scopeOptions] as const;

export default function RateLibraryPage() {
  const router = useRouter();
  const rates = useStore((s) => s.rates);
  const addRatesToEstimate = useStore((s) => s.addRatesToEstimate);
  const activeEstimateId = useStore((s) => s.activeEstimateId);
  const estimates = useStore((s) => s.estimates);
  const settings = useStore((s) => s.settings);
  const { setNewRateOpen } = useUI();
  const { push } = useToast();

  const [cat, setCat] = useState<(typeof RATE_CATS)[number]>("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = rates.filter(
    (r) =>
      (cat === "All" || r.category === cat) &&
      (q === "" ||
        (r.name + r.source).toLowerCase().includes(q.toLowerCase()))
  );

  const handleUseRate = (rateId: string) => {
    const targetEstimateId =
      activeEstimateId && estimates.find((e) => e.id === activeEstimateId)
        ? activeEstimateId
        : estimates[0]?.id;

    if (!targetEstimateId) {
      push("Open an estimate first");
      return;
    }
    const count = addRatesToEstimate(targetEstimateId, [rateId]);
    if (count > 0) {
      push("Added to active estimate");
    }
  };

  const handleUseAndOpen = (rateId: string) => {
    const targetEstimateId =
      activeEstimateId && estimates.find((e) => e.id === activeEstimateId)
        ? activeEstimateId
        : estimates[0]?.id;
    if (!targetEstimateId) {
      push("Open an estimate first");
      return;
    }
    addRatesToEstimate(targetEstimateId, [rateId]);
    router.push(`/estimates/${targetEstimateId}`);
  };

  return (
    <div className="page wide">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="page-title">Rate Library</h1>
          <p className="page-sub">
            Your personal database of FM rates. Click any rate to use it in
            an estimate.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn">
            <Download size={14} /> Import CSV
          </button>
          <button
            className="btn primary"
            onClick={() => setNewRateOpen(true)}
          >
            <Plus size={14} /> Add rate
          </button>
        </div>
      </div>

      <div className="filterbar">
        <div className="tb-search" style={{ width: 280 }}>
          <Search size={14} />
          <input
            placeholder="Search rates…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {RATE_CATS.map((c) => (
          <button
            key={c}
            className={"chip" + (cat === c ? " active" : "")}
            onClick={() => setCat(c)}
          >
            {c}
            {cat !== c && c !== "All" && (
              <span style={{ color: "var(--text-3)", fontSize: 11 }}>
                {rates.filter((r) => r.category === (c as Scope)).length}
              </span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <button
            className="btn ghost sm"
            onClick={() => setView("table")}
            style={{
              borderRadius: 0,
              background:
                view === "table" ? "var(--surface-hover)" : "transparent",
            }}
          >
            Table
          </button>
          <button
            className="btn ghost sm"
            onClick={() => setView("grid")}
            style={{
              borderRadius: 0,
              background:
                view === "grid" ? "var(--surface-hover)" : "transparent",
            }}
          >
            Cards
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div
          className="card tight"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18 }}>Item</th>
                <th>Category</th>
                <th>Unit</th>
                <th style={{ textAlign: "right" }}>Avg rate</th>
                <th>Supplier / source</th>
                <th>Last used</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="name" style={{ paddingLeft: 18 }}>
                    {r.name}
                    {r.notes && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--text-3)",
                          marginTop: 2,
                        }}
                      >
                        {r.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <Pill tone={scopeTint[r.category]}>{r.category}</Pill>
                  </td>
                  <td className="muted mono" style={{ fontSize: 12 }}>
                    {r.unit}
                  </td>
                  <td
                    className="mono"
                    style={{ textAlign: "right", fontWeight: 500 }}
                  >
                    {fmtAED(r.rate, settings.currency)}
                  </td>
                  <td className="muted">{r.source}</td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {r.last}
                  </td>
                  <td>
                    <button
                      className="btn ghost sm"
                      onClick={() => handleUseRate(r.id)}
                    >
                      Use <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty">No rates match your filters.</div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {filtered.map((r) => (
            <div key={r.id} className="card tight">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Pill tone={scopeTint[r.category]}>{r.category}</Pill>
                <button className="btn ghost sm" style={{ padding: 2 }}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div
                style={{ fontWeight: 500, fontSize: 14, marginTop: 10 }}
              >
                {r.name}
              </div>
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {r.source}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginTop: 12,
                }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {fmtAED(r.rate, settings.currency)}
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 12 }}>
                  / {r.unit}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                  Last used {r.last}
                </span>
                <button
                  className="btn sm"
                  onClick={() => handleUseAndOpen(r.id)}
                >
                  Use
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty" style={{ gridColumn: "1 / -1" }}>
              No rates match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
