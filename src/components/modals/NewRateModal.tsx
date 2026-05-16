"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import type { Scope } from "@/lib/types";
import { scopeOptions } from "@/lib/tints";

export function NewRateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addRate = useStore((s) => s.addRate);
  const { push } = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Scope>("Cleaning");
  const [unit, setUnit] = useState("month");
  const [rate, setRate] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName("");
    setCategory("Cleaning");
    setUnit("month");
    setRate("");
    setSource("");
    setNotes("");
  };

  const submit = () => {
    if (!name.trim() || !rate) {
      push("Name and rate are required");
      return;
    }
    addRate({
      name: name.trim(),
      category,
      unit,
      rate: Number(rate) || 0,
      source: source.trim() || "Internal",
      notes: notes.trim(),
    });
    push("Rate saved to library");
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add new rate"
      subtitle="Save a benchmark you can pull into any future estimate"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Save rate
          </button>
        </>
      }
    >
      <div className="col gap-12">
        <div className="field">
          <label>Item name</label>
          <input
            className="input"
            placeholder="e.g. AHU filter — pleated MERV 8"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as Scope)}
            >
              {scopeOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Unit</label>
            <input
              className="input"
              placeholder="pc / sqm / month / visit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Average rate (AED)</label>
            <input
              className="input mono"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <div className="field">
            <label>Supplier / source</label>
            <input
              className="input"
              placeholder="e.g. Camfil ME"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Any context — bulk pricing, exclusions, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
