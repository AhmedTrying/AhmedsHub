"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calculator,
  Database,
  Search,
  FileText,
  Download,
  Check,
  Sparkles,
  Plus,
  Copy,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { RatePickerModal } from "@/components/modals/RatePickerModal";
import { fmtAED, fmtNum } from "@/lib/format";
import { scopeOptions } from "@/lib/tints";
import { computeTotals, rowSelling, rowTotal } from "@/lib/calc";
import type { Scope } from "@/lib/types";

const CATEGORY_FILTERS = ["All", ...scopeOptions] as const;

export default function EstimateBuilderPage() {
  const params = useParams<{ estimateId: string }>();
  const router = useRouter();
  const requestedId = params?.estimateId;

  const { push } = useToast();
  const estimates = useStore((s) => s.estimates);
  const projects = useStore((s) => s.projects);
  const estimateItems = useStore((s) => s.estimateItems);
  const settings = useStore((s) => s.settings);

  const addEstimateItem = useStore((s) => s.addEstimateItem);
  const updateEstimateItem = useStore((s) => s.updateEstimateItem);
  const duplicateEstimateItem = useStore((s) => s.duplicateEstimateItem);
  const deleteEstimateItem = useStore((s) => s.deleteEstimateItem);
  const updateEstimate = useStore((s) => s.updateEstimate);
  const setActiveEstimateId = useStore((s) => s.setActiveEstimateId);
  const activeEstimateId = useStore((s) => s.activeEstimateId);

  // Resolve estimate id: explicit, or active, or first
  const estimate = useMemo(() => {
    if (requestedId && requestedId !== "active") {
      const found = estimates.find((e) => e.id === requestedId);
      if (found) return found;
    }
    if (activeEstimateId) {
      const found = estimates.find((e) => e.id === activeEstimateId);
      if (found) return found;
    }
    return estimates[0] || null;
  }, [requestedId, activeEstimateId, estimates]);

  useEffect(() => {
    if (estimate && estimate.id !== activeEstimateId) {
      setActiveEstimateId(estimate.id);
    }
  }, [estimate, activeEstimateId, setActiveEstimateId]);

  const rows = useMemo(
    () =>
      estimate
        ? estimateItems.filter((r) => r.estimateId === estimate.id)
        : [],
    [estimate, estimateItems]
  );

  const project = estimate
    ? projects.find((p) => p.id === estimate.projectId)
    : null;

  const [cat, setCat] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);

  // Generate-modal local form state — only initialized when modal opens.
  // Display values come straight from the store so they always reflect persisted state.
  const [qNumber, setQNumber] = useState("");
  const [qValidity, setQValidity] = useState("");
  const [qTerms, setQTerms] = useState("");
  const [qLetter, setQLetter] = useState("");
  const [qInclude, setQInclude] = useState(true);

  useEffect(() => {
    if (genOpen && estimate) {
      setQNumber(estimate.quotationNumber);
      setQValidity(estimate.validity);
      setQTerms(estimate.paymentTerms);
      setQLetter(estimate.coverLetter);
      setQInclude(estimate.includeAssumptions);
    }
  }, [genOpen, estimate]);

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (cat === "All" || r.category === cat) &&
          (q === "" ||
            (r.desc + r.item + r.notes)
              .toLowerCase()
              .includes(q.toLowerCase()))
      ),
    [rows, cat, q]
  );

  const totals = useMemo(() => computeTotals(rows), [rows]);

  if (!estimate) {
    return (
      <div className="page">
        <div className="empty">
          No estimate available yet.
          <div style={{ marginTop: 10 }}>
            <button
              className="btn primary"
              onClick={() => router.push("/projects")}
            >
              Go to projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addRow = () => {
    addEstimateItem({
      estimateId: estimate.id,
      item: `NEW-${rows.length + 1}`,
      desc: "New line item",
      category: "Cleaning" as Scope,
      unit: "month",
      qty: 1,
      cost: 0,
      markup: settings.defaultMarkup,
      notes: "",
    });
  };

  const save = () => {
    // Force a re-stamp of updatedAt so the activity stream and "last edited" are accurate.
    updateEstimate(estimate.id, {});
    push("Estimate saved");
  };

  const saveFromGenerateModal = () => {
    updateEstimate(estimate.id, {
      quotationNumber: qNumber,
      validity: qValidity,
      paymentTerms: qTerms,
      coverLetter: qLetter,
      includeAssumptions: qInclude,
    });
  };

  return (
    <div
      className="page wide"
      style={{ paddingLeft: 24, paddingRight: 24, maxWidth: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-3)",
              fontSize: 12,
            }}
          >
            <Calculator size={12} />
            {project?.name ?? estimate.name} · {estimate.version}
          </div>
          <h1 className="page-title">Estimate Builder</h1>
          <p className="page-sub">
            BOQ-style line items with automatic markup. Edits autosave.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => push("PDF export coming soon")}
          >
            <FileText size={14} /> Export PDF
          </button>
          <button
            className="btn"
            onClick={() => push("Excel export coming soon")}
          >
            <Download size={14} /> Export Excel
          </button>
          <button className="btn" onClick={save}>
            <Check size={14} /> Save
          </button>
          <button className="btn primary" onClick={() => setGenOpen(true)}>
            <Sparkles size={14} /> Generate quotation draft
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div
        className="stat-grid"
        style={{ marginTop: 16, gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        <div className="stat">
          <div className="label">Direct Cost</div>
          <div className="value mono">{fmtAED(totals.directCost, settings.currency)}</div>
          <div className="delta">{rows.length} line items</div>
        </div>
        <div className="stat">
          <div className="label">Markup Amount</div>
          <div className="value mono">{fmtAED(totals.markupAmt, settings.currency)}</div>
          <div className="delta">avg {totals.avgMarkupPct.toFixed(1)}%</div>
        </div>
        <div
          className="stat"
          style={{
            background: "var(--text)",
            color: "var(--bg)",
            borderColor: "var(--text)",
          }}
        >
          <div className="label" style={{ color: "rgba(255,255,255,0.6)" }}>
            Selling Total
          </div>
          <div className="value mono">{fmtAED(totals.sellingTotal, settings.currency)}</div>
          <div className="delta" style={{ color: "rgba(255,255,255,0.55)" }}>
            VAT excluded
          </div>
        </div>
        <div className="stat">
          <div className="label">Estimated Profit</div>
          <div
            className="value mono"
            style={{ color: "var(--t-green-fg)" }}
          >
            {fmtAED(totals.profit, settings.currency)}
          </div>
          <div className="delta">before overhead</div>
        </div>
      </div>

      {/* Main two-column */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 380px",
          gap: 18,
          marginTop: 20,
        }}
      >
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="tb-search" style={{ width: 200 }}>
              <Search size={14} />
              <input
                placeholder="Filter items…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              className="input"
              style={{ width: 140 }}
              value={cat}
              onChange={(e) =>
                setCat(e.target.value as (typeof CATEGORY_FILTERS)[number])
              }
            >
              {CATEGORY_FILTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div style={{ flex: 1 }} />
            <button
              className="btn ghost sm"
              onClick={() => setPickerOpen(true)}
            >
              <Database size={14} /> Pull from library
            </button>
            <button className="btn sm" onClick={addRow}>
              <Plus size={14} /> Add row
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table boq-table" style={{ minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={{ width: 70, paddingLeft: 14 }}>Item</th>
                  <th>Description</th>
                  <th style={{ width: 120 }}>Category</th>
                  <th style={{ width: 70 }}>Unit</th>
                  <th style={{ width: 70, textAlign: "right" }}>Qty</th>
                  <th style={{ width: 90, textAlign: "right" }}>Unit Cost</th>
                  <th style={{ width: 70, textAlign: "right" }}>Mkup %</th>
                  <th style={{ width: 90, textAlign: "right" }}>Selling</th>
                  <th style={{ width: 100, textAlign: "right" }}>Total</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => {
                  const selling = rowSelling(r);
                  const total = rowTotal(r);
                  return (
                    <tr key={r.id}>
                      <td
                        className="mono"
                        style={{
                          paddingLeft: 14,
                          color: "var(--text-2)",
                          fontSize: 12,
                        }}
                      >
                        <input
                          value={r.item}
                          onChange={(e) =>
                            updateEstimateItem(r.id, { item: e.target.value })
                          }
                          className="mono"
                          style={{ fontSize: 12 }}
                        />
                      </td>
                      <td>
                        <input
                          value={r.desc}
                          onChange={(e) =>
                            updateEstimateItem(r.id, { desc: e.target.value })
                          }
                        />
                        {r.notes && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-3)",
                              marginLeft: 6,
                            }}
                          >
                            {r.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          value={r.category}
                          onChange={(e) =>
                            updateEstimateItem(r.id, {
                              category: e.target.value as Scope,
                            })
                          }
                        >
                          {scopeOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={r.unit}
                          onChange={(e) =>
                            updateEstimateItem(r.id, { unit: e.target.value })
                          }
                          className="mono"
                          style={{ fontSize: 12 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={r.qty}
                          onChange={(e) =>
                            updateEstimateItem(r.id, {
                              qty: Number(e.target.value),
                            })
                          }
                          className="mono"
                          style={{ textAlign: "right" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={r.cost}
                          onChange={(e) =>
                            updateEstimateItem(r.id, {
                              cost: Number(e.target.value),
                            })
                          }
                          className="mono"
                          style={{ textAlign: "right" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={r.markup}
                          onChange={(e) =>
                            updateEstimateItem(r.id, {
                              markup: Number(e.target.value),
                            })
                          }
                          className="mono"
                          style={{ textAlign: "right" }}
                        />
                      </td>
                      <td
                        className="mono"
                        style={{
                          textAlign: "right",
                          color: "var(--text-2)",
                          paddingRight: 8,
                        }}
                      >
                        {fmtNum(selling)}
                      </td>
                      <td
                        className="mono"
                        style={{
                          textAlign: "right",
                          fontWeight: 500,
                          paddingRight: 8,
                        }}
                      >
                        {fmtNum(total)}
                      </td>
                      <td>
                        <div className="row-tools">
                          <button
                            title="Duplicate"
                            onClick={() => duplicateEstimateItem(r.id)}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => deleteEstimateItem(r.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={10} style={{ padding: 0 }}>
                    <button
                      className="btn ghost sm"
                      style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        padding: "10px 18px",
                        borderRadius: 0,
                        color: "var(--text-3)",
                      }}
                      onClick={addRow}
                    >
                      <Plus size={13} /> Add line item
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "right",
                      paddingRight: 14,
                      paddingTop: 14,
                      paddingBottom: 14,
                      color: "var(--text-3)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Subtotal
                  </td>
                  <td
                    className="mono"
                    style={{
                      textAlign: "right",
                      paddingTop: 14,
                      paddingBottom: 14,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {fmtAED(totals.sellingTotal, settings.currency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            {rows.length === 0 && (
              <div className="empty">
                No line items yet. Add a row or pull from the rate library.
              </div>
            )}
          </div>
        </div>

        {/* Quotation preview */}
        <div className="quot">
          <div className="qbrand">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--text)",
                color: "var(--bg)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Ahmed&apos;s Hub</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                FM Estimation · Dubai, UAE
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div
                className="mono"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {estimate.quotationNumber}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <h4>{project?.name ?? estimate.name}</h4>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
            {project?.scope.join(", ") ?? "Facilities Management"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 14,
              fontSize: 11,
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Bill to
              </div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>
                {project?.client ?? "Client"}
              </div>
              <div style={{ color: "var(--text-2)" }}>
                {project?.location ?? "—"}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Valid until
              </div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{estimate.validity}</div>
              <div style={{ color: "var(--text-2)" }}>Terms: {estimate.paymentTerms}</div>
            </div>
          </div>

          <table style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Rate</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td style={{ paddingRight: 6 }}>
                    {r.desc.length > 36
                      ? r.desc.slice(0, 36) + "…"
                      : r.desc}
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {r.qty}
                  </td>
                  <td
                    className="mono"
                    style={{
                      textAlign: "right",
                      color: "var(--text-2)",
                    }}
                  >
                    {fmtNum(rowSelling(r))}
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {fmtNum(rowTotal(r))}
                  </td>
                </tr>
              ))}
              {rows.length > 5 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      color: "var(--text-3)",
                      fontSize: 10.5,
                    }}
                  >
                    + {rows.length - 5} more items
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: "right",
                    color: "var(--text-3)",
                  }}
                >
                  Subtotal
                </td>
                <td className="mono" style={{ textAlign: "right" }}>
                  {fmtNum(totals.sellingTotal)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: "right",
                    color: "var(--text-3)",
                    borderTop: "none",
                    paddingTop: 2,
                  }}
                >
                  VAT 5%
                </td>
                <td
                  className="mono"
                  style={{
                    textAlign: "right",
                    borderTop: "none",
                    paddingTop: 2,
                  }}
                >
                  {fmtNum(totals.sellingTotal * 0.05)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={{ textAlign: "right" }}>
                  Total ({settings.currency})
                </td>
                <td className="mono" style={{ textAlign: "right" }}>
                  {fmtNum(totals.sellingTotal * 1.05)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px dashed var(--border-strong)",
              fontSize: 10,
              color: "var(--text-3)",
              lineHeight: 1.55,
            }}
          >
            <b style={{ color: "var(--text-2)" }}>Assumptions:</b> Working hours{" "}
            {settings.workingHours}. Consumables included. Specialist works
            excluded.
            <br />
            <b
              style={{
                color: "var(--text-2)",
                marginTop: 6,
                display: "inline-block",
              }}
            >
              Validity:
            </b>{" "}
            {estimate.validity} from issue.
          </div>
        </div>
      </div>

      {/* Rate picker */}
      <RatePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        estimateId={estimate.id}
      />

      {/* Generate quotation */}
      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate quotation draft"
        subtitle="A polished PDF using your template & current line items"
        footer={
          <>
            <button className="btn" onClick={() => setGenOpen(false)}>
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={() => {
                saveFromGenerateModal();
                setGenOpen(false);
                push("Quotation draft created");
              }}
            >
              <Sparkles size={14} /> Generate
            </button>
          </>
        }
      >
        <div className="col gap-12">
          <div className="field">
            <label>Quotation number</label>
            <input
              className="input mono"
              value={qNumber}
              onChange={(e) => setQNumber(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Validity</label>
              <input
                className="input"
                value={qValidity}
                onChange={(e) => setQValidity(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Payment terms</label>
              <input
                className="input"
                value={qTerms}
                onChange={(e) => setQTerms(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Cover letter</label>
            <textarea
              className="input"
              rows={4}
              value={qLetter}
              onChange={(e) => setQLetter(e.target.value)}
            />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={qInclude}
              onChange={(e) => setQInclude(e.target.checked)}
            />
            Include assumptions &amp; exclusions sheet
          </label>
        </div>
      </Modal>
    </div>
  );
}

