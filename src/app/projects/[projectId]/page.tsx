"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  Calculator,
  User,
  MapPin,
  Clock,
  Plus,
  Camera,
  FileText,
  ChevronRight,
  Star,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtAED } from "@/lib/format";
import { statusTint, scopeTint, priorityTint } from "@/lib/tints";
import { Pill } from "@/components/Pill";
import { computeTotals } from "@/lib/calc";

type Tab = "Notes" | "Estimate" | "Site Visit" | "Tasks" | "Files";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const id = params?.projectId;

  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const estimates = useStore((s) => s.estimates);
  const estimateItems = useStore((s) => s.estimateItems);
  const togglePinProject = useStore((s) => s.togglePinProject);

  const [tab, setTab] = useState<Tab>("Notes");

  const estimate = useMemo(
    () => estimates.find((e) => e.projectId === id) || null,
    [estimates, id]
  );
  const items = useMemo(
    () =>
      estimate
        ? estimateItems.filter((r) => r.estimateId === estimate.id)
        : [],
    [estimate, estimateItems]
  );
  const totals = useMemo(() => computeTotals(items), [items]);

  if (!project) {
    return (
      <div className="page">
        <div className="empty">
          Project not found.{" "}
          <Link href="/projects" className="btn ghost sm">
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const initial = project.name[0]?.toUpperCase() ?? "P";
  const tabs: Tab[] = ["Notes", "Estimate", "Site Visit", "Tasks", "Files"];

  const openEstimate = () => {
    if (estimate) router.push(`/estimates/${estimate.id}`);
    else router.push("/estimates/active");
  };

  return (
    <div className="page wide">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-2)",
          fontSize: 13,
        }}
      >
        <Link href="/projects" className="btn ghost sm">
          ← Projects
        </Link>
        <span className="muted">/</span>
        <span>{project.client}</span>
      </div>

      <div className="proj-hero">
        <div className="proj-cover">{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h1>{project.name}</h1>
            <Pill tone={statusTint[project.status]} dot>
              {project.status}
            </Pill>
          </div>
          <div className="meta">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <User size={12} /> {project.client}
            </span>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} /> {project.location}
            </span>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> Due {project.dueDate}
            </span>
            <span>·</span>
            <span
              className="mono"
              style={{ fontWeight: 500, color: "var(--text)" }}
            >
              {project.value ? fmtAED(project.value) : "Not estimated"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {project.scope.map((s) => (
              <Pill key={s} tone={scopeTint[s]}>
                {s}
              </Pill>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => togglePinProject(project.id)}
            title={project.pinned ? "Unpin" : "Pin"}
          >
            <Star size={14} fill={project.pinned ? "currentColor" : "none"} />
            {project.pinned ? "Pinned" : "Pin"}
          </button>
          <button className="btn">
            <Download size={14} /> Export
          </button>
          <button className="btn primary" onClick={openEstimate}>
            <Calculator size={14} /> Open estimate
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={"tab" + (tab === t ? " active" : "")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 18,
        }}
      >
        <div>
          {tab === "Notes" && <ProjectNotesTab projectId={project.id} />}
          {tab === "Estimate" && (
            <ProjectEstimateTab onOpen={openEstimate} />
          )}
          {tab === "Site Visit" && <ProjectSiteVisitTab />}
          {tab === "Tasks" && <ProjectTasksTab projectId={project.id} />}
          {tab === "Files" && <ProjectFilesTab />}
        </div>

        <aside className="col">
          <div className="card tight">
            <div className="section-h">
              <h2>Overview</h2>
            </div>
            <Row k="Client" v={project.client} />
            <Row k="Location" v={project.location} />
            <Row
              k="Status"
              v={<Pill tone={statusTint[project.status]}>{project.status}</Pill>}
            />
            <Row
              k="Priority"
              v={
                <Pill tone={priorityTint[project.priority]}>
                  {project.priority}
                </Pill>
              }
            />
            <Row k="Due date" v={project.dueDate} />
            <Row k="Owner" v={project.owner} />
            <Row k="Last updated" v={project.updated} last />
          </div>

          <div className="card tight">
            <div className="section-h">
              <h2>Follow-up reminders</h2>
            </div>
            {project.next ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#E8A33A",
                    marginTop: 5,
                  }}
                />
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  <div style={{ fontWeight: 500 }}>{project.next}</div>
                  <div style={{ color: "var(--text-3)", marginTop: 2 }}>
                    Due {project.dueDate}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty" style={{ padding: 12 }}>
                No reminders set.
              </div>
            )}
            <button className="btn ghost sm" style={{ marginTop: 6 }}>
              <Plus size={12} /> Add reminder
            </button>
          </div>

          <div className="card tight">
            <div className="section-h">
              <h2>Estimate summary</h2>
            </div>
            <Row
              k="Direct cost"
              v={<span className="mono">{fmtAED(totals.directCost)}</span>}
            />
            <Row
              k={`Markup (avg ${totals.avgMarkupPct.toFixed(1)}%)`}
              v={<span className="mono">{fmtAED(totals.markupAmt)}</span>}
            />
            <Row
              k="Selling total"
              v={
                <b className="mono">{fmtAED(totals.sellingTotal)}</b>
              }
              bold
            />
            <Row
              k="Profit"
              v={
                <span
                  className="mono"
                  style={{ color: "var(--t-green-fg)" }}
                >
                  {fmtAED(totals.profit)}
                </span>
              }
              last
            />
            <button
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 10,
              }}
              onClick={openEstimate}
            >
              <Calculator size={14} /> Open Estimate Builder
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  last,
  bold,
}: {
  k: string;
  v: React.ReactNode;
  last?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
        fontSize: 12.5,
      }}
    >
      <span style={{ color: "var(--text-3)" }}>{k}</span>
      <span style={{ fontWeight: bold ? 600 : 400 }}>{v}</span>
    </div>
  );
}

function ProjectNotesTab({ projectId }: { projectId: string }) {
  const notes = useStore((s) =>
    s.notes.filter((n) => n.project === projectId)
  );

  return (
    <div className="card">
      <div className="section-h">
        <h2>Project notes</h2>
        <Link href="/notes" className="btn ghost sm">
          Open notes <ChevronRight size={12} />
        </Link>
      </div>
      {notes.length === 0 ? (
        <div className="empty">No notes linked to this project yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                padding: 12,
                border: "1px solid var(--border)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13.5,
                  marginBottom: 4,
                }}
              >
                {n.title}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {n.body}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 8,
                  fontSize: 11.5,
                  color: "var(--text-3)",
                }}
              >
                <span>{n.when}</span>
                {n.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "0 5px",
                      background: "var(--surface-2)",
                      borderRadius: 3,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEstimateTab({ onOpen }: { onOpen: () => void }) {
  const estimates = useStore((s) => s.estimates);
  const estimateItems = useStore((s) => s.estimateItems);
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;
  const est = estimates.find((e) => e.projectId === projectId);
  const items = est
    ? estimateItems.filter((r) => r.estimateId === est.id)
    : [];

  return (
    <div className="card">
      <div className="section-h">
        <h2>Estimate — {est?.version ?? "Not started"}</h2>
        <button className="btn" onClick={onOpen}>
          Open builder <ChevronRight size={12} />
        </button>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        {items.length} line item{items.length === 1 ? "" : "s"}
      </p>
      {items.length === 0 ? (
        <div className="empty">No estimate items yet. Open the builder to start.</div>
      ) : (
        <table className="table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Unit cost</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 8).map((r) => {
              const sell = r.cost * (1 + r.markup / 100);
              const total = r.qty * sell;
              return (
                <tr key={r.id}>
                  <td className="name">{r.desc}</td>
                  <td>
                    <Pill tone={scopeTint[r.category]}>{r.category}</Pill>
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {r.qty}
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {r.cost.toLocaleString()}
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ProjectSiteVisitTab() {
  return (
    <div className="card">
      <div className="section-h">
        <h2>Site visit</h2>
        <Link href="/site-visits" className="btn ghost sm">
          Open checklist <ChevronRight size={12} />
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              aspectRatio: "4/3",
              borderRadius: 6,
              background: "var(--surface-2)",
              border: "1px dashed var(--border-strong)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-3)",
              fontSize: 11,
            }}
            className="mono"
          >
            PHOTO {i}
          </div>
        ))}
      </div>
      <button className="btn ghost sm">
        <Camera size={12} /> Add photo
      </button>
    </div>
  );
}

function ProjectTasksTab({ projectId }: { projectId: string }) {
  const tasks = useStore((s) =>
    s.projectTasks.filter((t) => t.projectId === projectId)
  );
  const addProjectTask = useStore((s) => s.addProjectTask);
  const toggleProjectTask = useStore((s) => s.toggleProjectTask);
  const updateProjectTask = useStore((s) => s.updateProjectTask);
  const deleteProjectTask = useStore((s) => s.deleteProjectTask);

  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const addNow = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    addProjectTask(projectId, trimmed);
    setNewText("");
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };
  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateProjectTask(editingId, { text: editText.trim() });
    }
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="card">
      <div className="section-h">
        <h2>Tasks &amp; checklist</h2>
        <span className="muted" style={{ fontSize: 12 }}>
          {tasks.filter((t) => t.done).length}/{tasks.length} complete
        </span>
      </div>
      {tasks.length === 0 && (
        <div className="empty" style={{ padding: 16 }}>
          No tasks yet — add one below.
        </div>
      )}
      {tasks.map((t) => (
        <div
          key={t.id}
          className={"check" + (t.done ? " done" : "")}
          style={{ alignItems: "center" }}
        >
          <input
            type="checkbox"
            checked={t.done}
            onChange={() => toggleProjectTask(t.id)}
          />
          {editingId === t.id ? (
            <input
              className="input"
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditingId(null);
                  setEditText("");
                }
              }}
              style={{ flex: 1 }}
            />
          ) : (
            <span
              style={{ flex: 1, cursor: "text" }}
              onDoubleClick={() => startEdit(t.id, t.text)}
              title="Double-click to edit"
            >
              {t.text}
            </span>
          )}
          <div style={{ display: "flex", gap: 4, opacity: 0.7 }}>
            {editingId !== t.id && (
              <button
                className="btn ghost sm"
                onClick={() => startEdit(t.id, t.text)}
                title="Edit"
              >
                Edit
              </button>
            )}
            <button
              className="btn ghost sm"
              onClick={() => deleteProjectTask(t.id)}
              title="Delete"
              style={{ color: "var(--t-red-fg)" }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          className="input"
          placeholder="Add a new task…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addNow();
          }}
        />
        <button className="btn sm" onClick={addNow}>
          <Plus size={12} /> Add task
        </button>
      </div>
    </div>
  );
}

function ProjectFilesTab() {
  return (
    <div className="card">
      <div className="section-h">
        <h2>Files &amp; attachments</h2>
        <button className="btn ghost sm">
          <Plus size={12} /> Upload
        </button>
      </div>
      {[
        { n: "RFQ_MarinaHeights_v1.pdf", s: "2.4 MB · pdf" },
        { n: "Floor plans — levels 1–12.pdf", s: "8.1 MB · pdf" },
        { n: "Existing FM contract (redacted).pdf", s: "640 KB · pdf" },
        { n: "Site visit photos.zip", s: "14 photos · 22 MB" },
      ].map((f) => (
        <div
          key={f.n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 6px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--surface-2)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-2)",
            }}
          >
            <FileText size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{f.n}</div>
            <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{f.s}</div>
          </div>
          <button className="btn ghost sm">
            <Download size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

