"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Star,
  MoreHorizontal,
  Clock,
  FolderKanban,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { useToast } from "@/components/Toast";
import { NoteEditor } from "@/components/NoteEditor";

export default function NotesPage() {
  const notes = useStore((s) => s.notes);
  const projects = useStore((s) => s.projects);
  const togglePinNote = useStore((s) => s.togglePinNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);
  const { setNewNoteOpen } = useUI();
  const { push } = useToast();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  // Auto-pick a note when the selected one disappears (e.g. after delete)
  useEffect(() => {
    if (selectedId && !notes.find((n) => n.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? notes[0]?.id ?? null);
    }
    if (!selectedId && notes.length > 0) {
      setSelectedId(notes[0].id);
    }
  }, [notes, selectedId, filtered]);

  // Reset confirm-delete state when switching notes
  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedId]);

  const current = notes.find((n) => n.id === selectedId) ?? null;
  const currentProject = current
    ? projects.find((p) => p.id === current.project)
    : null;

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
                onClick={() => setSelectedId(n.id)}
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
                  fontFamily: "inherit",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  {n.pinned && <Star size={11} fill="currentColor" />}
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
                  {plaintext(n.body)}
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
          <NoteDetail
            // re-mount NoteEditor when selecting a different note
            key={current.id}
            noteId={current.id}
            title={current.title}
            body={current.body}
            tags={current.tags}
            pinned={current.pinned}
            when={current.when}
            project={currentProject}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            onTitleChange={(v) => updateNote(current.id, { title: v })}
            onBodyChange={(v) => updateNote(current.id, { body: v })}
            onTagsChange={(v) => updateNote(current.id, { tags: v })}
            onTogglePin={() => togglePinNote(current.id)}
            onDelete={() => {
              const title = current.title;
              deleteNote(current.id);
              push(`Deleted "${title}"`);
              setConfirmDelete(false);
            }}
          />
        ) : (
          <div className="empty" style={{ alignSelf: "center", justifySelf: "center" }}>
            No note selected.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ detail pane ============================ */

interface DetailProps {
  noteId: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  when: string;
  project: { id: string; name: string } | null | undefined;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onTagsChange: (v: string[]) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function NoteDetail({
  title,
  body,
  tags,
  pinned,
  when,
  project,
  confirmDelete,
  setConfirmDelete,
  onTitleChange,
  onBodyChange,
  onTagsChange,
  onTogglePin,
  onDelete,
}: DetailProps) {
  const [titleDraft, setTitleDraft] = useState(title);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync title draft when switching notes (key remount handles most of this,
  // but this keeps in-place external updates in sync).
  useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  const onTitleInput = (v: string) => {
    setTitleDraft(v);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      if (v !== title) onTitleChange(v);
    }, 400);
  };

  return (
    <div
      style={{
        padding: "28px 40px 80px",
        maxWidth: 840,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* header row */}
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
        {project && (
          <>
            <FolderKanban size={12} />
            <span>{project.name}</span>
            <span>·</span>
          </>
        )}
        <Clock size={12} />
        <span>{when}</span>
        <div style={{ flex: 1 }} />
        <button className="btn ghost sm" onClick={onTogglePin}>
          <Star size={13} fill={pinned ? "currentColor" : "none"} />{" "}
          {pinned ? "Pinned" : "Pin"}
        </button>
        {!confirmDelete ? (
          <button
            className="btn ghost sm"
            onClick={() => setConfirmDelete(true)}
            title="Delete note"
            style={{ color: "var(--t-red-fg)" }}
          >
            <Trash2 size={13} /> Delete
          </button>
        ) : (
          <>
            <button
              className="btn ghost sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              className="btn sm"
              style={{
                background: "var(--t-red-bg)",
                color: "var(--t-red-fg)",
                borderColor: "var(--t-red-bg)",
              }}
              onClick={onDelete}
            >
              <Trash2 size={13} /> Confirm delete
            </button>
          </>
        )}
        <button className="btn ghost sm" title="More">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* title */}
      <input
        className="note-title-input"
        value={titleDraft}
        onChange={(e) => onTitleInput(e.target.value)}
        placeholder="Untitled"
        spellCheck
      />

      {/* tags */}
      <TagEditor tags={tags} onChange={onTagsChange} />

      {/* body */}
      <NoteEditor content={body} onChange={onBodyChange} />
    </div>
  );
}

/* ============================ tag editor ============================ */

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const remove = (t: string) => onChange(tags.filter((x) => x !== t));

  const commit = () => {
    const v = draft.trim().replace(/^#/, "");
    if (v && !tags.includes(v)) {
      onChange([...tags, v]);
    }
    setDraft("");
    setAdding(false);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      {tags.map((t) => (
        <span key={t} className="note-tag">
          <span>#{t}</span>
          <button
            type="button"
            className="x"
            aria-label={`Remove tag ${t}`}
            onClick={() => remove(t)}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          className="note-tag-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="tag name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commit}
        />
      ) : (
        <button
          type="button"
          className="note-tb-btn"
          onClick={() => setAdding(true)}
          title="Add tag"
          style={{ width: 22, height: 22 }}
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

/* ============================ helpers ============================ */

/** Strip HTML for the list-preview snippet. Cheap & cheerful. */
function plaintext(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}
