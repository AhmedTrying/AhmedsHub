"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

export function NewNoteModal({
  open,
  onClose,
  defaultProjectId,
}: {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string | null;
}) {
  const addNote = useStore((s) => s.addNote);
  const projects = useStore((s) => s.projects);
  const { push } = useToast();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [project, setProject] = useState<string>(defaultProjectId || "");

  const reset = () => {
    setTitle("");
    setBody("");
    setTagsInput("");
    setProject(defaultProjectId || "");
  };

  const submit = () => {
    if (!title.trim()) {
      push("Title is required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    addNote({
      title: title.trim(),
      body: body.trim(),
      tags,
      project: project || null,
      pinned: false,
    });
    push("Note saved");
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick note"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Save note
          </button>
        </>
      }
    >
      <div className="col gap-12">
        <input
          className="input"
          placeholder="Title"
          style={{ fontSize: 15, fontWeight: 500, padding: "8px 12px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          className="input"
          rows={5}
          placeholder="Write your note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="grid-2">
          <div className="field">
            <label>Tags (comma separated)</label>
            <input
              className="input"
              placeholder="e.g. HVAC, Supplier"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Link to project</label>
            <select
              className="input"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
