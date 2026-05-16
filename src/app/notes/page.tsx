"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Star,
  MoreHorizontal,
  Clock,
  FolderKanban,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function NotesPage() {
  const notes = useStore((s) => s.notes);
  const projects = useStore((s) => s.projects);
  const togglePinNote = useStore((s) => s.togglePinNote);
  const updateNote = useStore((s) => s.updateNote);
  const { setNewNoteOpen } = useUI();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const allTags = ["All", ...Array.from(new Set(notes.flatMap((n) => n.tags)))];

  const filtered = useMemo(
    () =>
      notes
        .filter(
          (n) =>
            (tag === "All" || n.tags.includes(tag)) &&
            (q === "" ||
              (n.title + n.body).toLowerCase().includes(q.toLowerCase()))
        )
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)),
    [notes, tag, q]
  );

  const current =
    notes.find((n) => n.id === selectedId) ?? filtered[0] ?? notes[0];
  const currentProject = current
    ? projects.find((p) => p.id === current.project)
    : null;

  const startEdit = () => {
    if (!current) return;
    setEditTitle(current.title);
    setEditBody(current.body);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!current) return;
    updateNote(current.id, { title: editTitle, body: editBody });
    setEditing(false);
  };

  return (
    <div className="page wide" style={{ padding: 0, maxWidth: "none" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          minHeight: "calc(100vh - 50px)",
        }}
      >
        {/* List */}
        <div
          style={{
            borderRight: "1px solid var(--border)",
            background: "var(--bg-soft)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 16px 10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Notes
              </h2>
              <button
                className="btn sm primary"
                onClick={() => setNewNoteOpen(true)}
              >
                <Plus size={13} /> New
              </button>
            </div>
            <div className="tb-search">
              <Search size={14} />
              <input
                placeholder="Search notes…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {allTags.slice(0, 8).map((t) => (
                <button
                  key={t}
                  className={"chip" + (tag === t ? " active" : "")}
                  onClick={() => setTag(t)}
                  style={{ fontSize: 11.5, padding: "2px 8px" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {filtered.length === 0 && (
              <div className="empty">No notes match.</div>
            )}
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setSelectedId(n.id);
                  setEditing(false);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  background:
                    selectedId === n.id ? "var(--surface)" : "transparent",
                  border:
                    "1px solid " +
                    (selectedId === n.id
                      ? "var(--border-strong)"
                      : "transparent"),
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  {n.pinned && (
                    <Star size={11} fill="currentColor" />
                  )}
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 13.5,
                      flex: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {n.title}
                  </div>
                </div>
                <div
                  style={{
                    color: "var(--text-2)",
                    fontSize: 12,
                    marginTop: 4,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {n.body}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    fontSize: 11,
                    color: "var(--text-3)",
                  }}
                >
                  <span>{n.when}</span>
                  {n.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "0 5px",
                        background: "var(--surface-2)",
                        borderRadius: 3,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {current ? (
          <div
            style={{
              padding: "28px 40px 80px",
              maxWidth: 840,
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                color: "var(--text-3)",
                fontSize: 12,
                alignItems: "center",
              }}
            >
              {currentProject && (
                <>
                  <FolderKanban size={12} />
                  <span>{currentProject.name}</span>
                  <span>·</span>
                </>
              )}
              <Clock size={12} />
              <span>{current.when}</span>
              <div style={{ flex: 1 }} />
              <button
                className="btn ghost sm"
                onClick={() => togglePinNote(current.id)}
              >
                <Star
                  size={13}
                  fill={current.pinned ? "currentColor" : "none"}
                />{" "}
                {current.pinned ? "Pinned" : "Pin"}
              </button>
              {!editing ? (
                <button className="btn ghost sm" onClick={startEdit}>
                  Edit
                </button>
              ) : (
                <>
                  <button
                    className="btn ghost sm"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn sm" onClick={saveEdit}>
                    Save
                  </button>
                </>
              )}
              <button className="btn ghost sm">
                <MoreHorizontal size={14} />
              </button>
            </div>

            {editing ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    fontSize: 32,
                    letterSpacing: "-0.02em",
                    fontWeight: 700,
                    margin: "0 0 14px",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    background: "transparent",
                    color: "var(--text)",
                  }}
                />
                <textarea
                  className="input"
                  rows={16}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  style={{ fontSize: 15, lineHeight: 1.7, resize: "vertical" }}
                />
              </>
            ) : (
              <>
                <h1
                  style={{
                    fontSize: 32,
                    letterSpacing: "-0.02em",
                    fontWeight: 700,
                    margin: "0 0 14px",
                  }}
                >
                  {current.title}
                </h1>
                <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
                  {current.tags.map((t) => (
                    <span key={t} className="pill gray">
                      #{t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--text-2)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {current.body}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="empty">No note selected.</div>
        )}
      </div>
    </div>
  );
}
