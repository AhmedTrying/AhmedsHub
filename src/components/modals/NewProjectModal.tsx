"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import type { ProjectStatus, Scope, Priority } from "@/lib/types";
import { scopeOptions, statusOptions } from "@/lib/tints";

export function NewProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addProject = useStore((s) => s.addProject);
  const { push } = useToast();

  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  };

  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["Cleaning"]);
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState<string>(defaultDate());
  const [status, setStatus] = useState<ProjectStatus>("New");
  const [priority, setPriority] = useState<Priority>("Medium");

  const reset = () => {
    setName("");
    setClient("");
    setLocation("");
    setScopes(["Cleaning"]);
    setValue("");
    setDueDate(defaultDate());
    setStatus("New");
    setPriority("Medium");
  };

  const formatDueDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const submit = () => {
    if (!name.trim() || !client.trim()) {
      push("Name and client are required");
      return;
    }
    addProject({
      name: name.trim(),
      clientId: "",
      client: client.trim(),
      location: location.trim() || "—",
      scope: scopes,
      status,
      value: Number(value) || 0,
      updated: "just now",
      owner: "Ahmed",
      priority,
      dueDate: formatDueDate(dueDate),
      next: "",
    });
    push(`Project "${name}" created`);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      subtitle="Capture the basics — you can edit anything later."
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Create project
          </button>
        </>
      }
    >
      <div className="col gap-12">
        <div className="field">
          <label>Project name</label>
          <input
            className="input"
            placeholder="e.g. Marina Heights Tower — Annual FM"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Client</label>
            <input
              className="input"
              placeholder="Client name"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              className="input"
              placeholder="Dubai Marina"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Scope</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {scopeOptions.map((s) => (
              <button
                key={s}
                className={"chip" + (scopes.includes(s) ? " active" : "")}
                onClick={() =>
                  setScopes((sc) =>
                    sc.includes(s) ? sc.filter((x) => x !== s) : [...sc, s]
                  )
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Estimated value (AED)</label>
            <input
              className="input mono"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <div className="field">
            <label>Due date</label>
            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
