"use client";

import { useMemo, useState } from "react";
import { MapPin, Camera, Sparkles, Plus, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

export default function SiteVisitPage() {
  const siteVisits = useStore((s) => s.siteVisits);
  const checklistItems = useStore((s) => s.checklistItems);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const addChecklistItem = useStore((s) => s.addChecklistItem);
  const updateSiteVisit = useStore((s) => s.updateSiteVisit);
  const { push } = useToast();

  const visit = siteVisits[0];

  const groups = useMemo(() => {
    if (!visit) return {} as Record<string, typeof checklistItems>;
    const out: Record<string, typeof checklistItems> = {};
    checklistItems
      .filter((c) => c.siteVisitId === visit.id)
      .forEach((c) => {
        if (!out[c.group]) out[c.group] = [];
        out[c.group].push(c);
      });
    return out;
  }, [checklistItems, visit]);

  const [activeGroup, setActiveGroup] = useState<string>("General");
  const [newItemText, setNewItemText] = useState("");

  if (!visit) {
    return (
      <div className="page">
        <div className="empty">No site visit recorded yet.</div>
      </div>
    );
  }

  const total = Object.values(groups).reduce((s, arr) => s + arr.length, 0);
  const done = Object.values(groups).reduce(
    (s, arr) => s + arr.filter((c) => c.done).length,
    0
  );
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const groupKeys = Object.keys(groups);
  const currentGroup = groups[activeGroup] || groups[groupKeys[0]] || [];

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
          <div
            style={{
              color: "var(--text-3)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <MapPin size={12} /> Site Visit Mode · {visit.title} · {visit.date}
          </div>
          <h1 className="page-title">Site visit checklist</h1>
          <p className="page-sub">
            Tick off as you go. Convert notes to estimate assumptions when
            you&apos;re done.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn">
            <Camera size={14} /> Add photos
          </button>
          <button
            className="btn primary"
            onClick={() => push("Notes converted to assumptions")}
          >
            <Sparkles size={14} /> Convert to assumptions
          </button>
        </div>
      </div>

      <div
        className="card tight"
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontSize: 12.5,
            }}
          >
            <span style={{ fontWeight: 500 }}>Overall progress</span>
            <span className="muted mono">
              {done}/{total} items · {pct}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: "var(--surface-2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: pct + "%",
                height: "100%",
                background: "var(--text)",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {groupKeys.map((g) => {
            const items = groups[g];
            const d = items.filter((c) => c.done).length;
            return (
              <div
                key={g}
                style={{
                  textAlign: "center",
                  padding: "6px 10px",
                  borderRadius: 6,
                  background:
                    d === items.length
                      ? "var(--t-green-bg)"
                      : "var(--surface-2)",
                  color:
                    d === items.length
                      ? "var(--t-green-fg)"
                      : "var(--text-2)",
                  fontSize: 11,
                }}
              >
                <div
                  style={{ fontWeight: 600, fontSize: 13 }}
                  className="mono"
                >
                  {d}/{items.length}
                </div>
                <div>{g}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 320px",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div className="card tight">
          <div className="section-h" style={{ marginBottom: 6 }}>
            <h2>Sections</h2>
          </div>
          {groupKeys.map((g) => (
            <button
              key={g}
              className={"sb-item" + (activeGroup === g ? " active" : "")}
              onClick={() => setActiveGroup(g)}
            >
              <span>{g}</span>
              <span className="count">
                {groups[g].filter((c) => c.done).length}/{groups[g].length}
              </span>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="section-h">
            <h2>{activeGroup}</h2>
          </div>
          {currentGroup.map((item) => (
            <label
              key={item.id}
              className={"check" + (item.done ? " done" : "")}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleChecklistItem(item.id)}
              />
              <span>{item.text}</span>
              {item.done && <Check size={12} />}
            </label>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              className="input"
              placeholder="Add a checklist item…"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItemText.trim()) {
                  addChecklistItem(visit.id, activeGroup, newItemText.trim());
                  setNewItemText("");
                }
              }}
            />
            <button
              className="btn sm"
              onClick={() => {
                if (newItemText.trim()) {
                  addChecklistItem(visit.id, activeGroup, newItemText.trim());
                  setNewItemText("");
                }
              }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="section-h">
              <h2>Field notes</h2>
            </div>
            <textarea
              className="input"
              rows={6}
              value={visit.notes}
              onChange={(e) =>
                updateSiteVisit(visit.id, { notes: e.target.value })
              }
              style={{ resize: "vertical" }}
            />
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--text-3)",
              }}
            >
              <span>Autosaved</span>
              <span>{visit.notes.length} chars</span>
            </div>
          </div>

          <div className="card tight">
            <div className="section-h">
              <h2>Photos</h2>
              <span className="muted" style={{ fontSize: 12 }}>
                4
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1/1",
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    border: "1px dashed var(--border-strong)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-3)",
                    fontSize: 10,
                  }}
                  className="mono"
                >
                  PHOTO {i}
                </div>
              ))}
            </div>
            <button
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <Plus size={13} /> Upload
            </button>
          </div>

          <div className="card tight">
            <div className="section-h">
              <h2>Quick info</h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 12.5,
              }}
            >
              <Info
                label="Site contact"
                value={visit.contact}
                onChange={(v) => updateSiteVisit(visit.id, { contact: v })}
              />
              <Info
                label="Phone"
                mono
                value={visit.phone}
                onChange={(v) => updateSiteVisit(visit.id, { phone: v })}
              />
              <Info
                label="GFA"
                mono
                value={visit.gfa}
                onChange={(v) => updateSiteVisit(visit.id, { gfa: v })}
              />
              <Info
                label="Hours"
                value={visit.hours}
                onChange={(v) => updateSiteVisit(visit.id, { hours: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  onChange,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span className="subtle">{label}</span>
      <input
        className={mono ? "mono" : ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          textAlign: "right",
          border: "none",
          background: "transparent",
          outline: "none",
          fontWeight: 500,
          maxWidth: 180,
          color: "var(--text)",
        }}
      />
    </div>
  );
}
