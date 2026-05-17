"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash2, Sun, Moon } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import type { Settings as TSettings } from "@/lib/types";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);
  const resetWorkspace = useStore((s) => s.resetWorkspace);
  const { push } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const update = <K extends keyof TSettings>(k: K, v: TSettings[K]) =>
    updateSettings({ [k]: v } as Partial<TSettings>);

  const doExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ahmeds-hub-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    push("Workspace exported");
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const ok = await importJSON(String(reader.result || ""));
      if (ok) push("Workspace imported");
      else push("Invalid file format");
    };
    reader.readAsText(file);
  };

  return (
    <div className="page" style={{ maxWidth: 840 }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Personal preferences. Saved automatically.</p>

      <div className="col gap-12" style={{ marginTop: 18 }}>
        <SettingRow label="Personal name" sub="Shown on quotations & exports">
          <input
            className="input"
            value={settings.personalName}
            onChange={(e) => update("personalName", e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </SettingRow>
        <SettingRow label="Currency" sub="Used across all estimates">
          <select
            className="input"
            value={settings.currency}
            onChange={(e) =>
              update("currency", e.target.value as TSettings["currency"])
            }
            style={{ maxWidth: 160 }}
          >
            <option>AED</option>
            <option>USD</option>
            <option>EUR</option>
            <option>SAR</option>
            <option>QAR</option>
          </select>
        </SettingRow>
        <SettingRow label="Default markup %" sub="Applied to new BOQ rows">
          <input
            className="input mono"
            type="number"
            value={settings.defaultMarkup}
            onChange={(e) =>
              update("defaultMarkup", Number(e.target.value) || 0)
            }
            style={{ maxWidth: 120 }}
          />
        </SettingRow>
        <SettingRow
          label="Default working hours"
          sub="Mon–Sat unless specified"
        >
          <input
            className="input"
            value={settings.workingHours}
            onChange={(e) => update("workingHours", e.target.value)}
            style={{ maxWidth: 200 }}
          />
        </SettingRow>
        <SettingRow label="Theme" sub="Choose how the app looks">
          <div style={{ display: "flex", gap: 6 }}>
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                className={"btn sm" + (settings.theme === t ? " primary" : "")}
                onClick={() => update("theme", t)}
              >
                {t === "light" ? <Sun size={12} /> : <Moon size={12} />}{" "}
                {t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Export defaults" sub="Default format & branding">
          <select
            className="input"
            value={settings.exportDefault}
            onChange={(e) =>
              update(
                "exportDefault",
                e.target.value as TSettings["exportDefault"]
              )
            }
            style={{ maxWidth: 160 }}
          >
            <option>PDF</option>
            <option>Excel</option>
            <option>Both</option>
          </select>
        </SettingRow>
        <SettingRow
          label="Notifications"
          sub="Toast confirmations & due-date alerts"
        >
          <Toggle
            on={settings.notifications}
            onChange={(v) => update("notifications", v)}
          />
        </SettingRow>
      </div>

      <div className="divider" />

      <div className="card" style={{ background: "var(--bg-soft)" }}>
        <div className="section-h">
          <h2>Data</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={doExport}>
            <Download size={14} /> Export all data
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Import from JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
          {!confirmReset ? (
            <button
              className="btn"
              style={{ color: "var(--t-red-fg)" }}
              onClick={() => setConfirmReset(true)}
            >
              <Trash2 size={14} /> Reset workspace
            </button>
          ) : (
            <>
              <span style={{ alignSelf: "center", fontSize: 12, color: "var(--text-2)" }}>
                Are you sure?
              </span>
              <button
                className="btn"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{
                  background: "var(--t-red-bg)",
                  color: "var(--t-red-fg)",
                  borderColor: "var(--t-red-bg)",
                }}
                onClick={async () => {
                  await resetWorkspace();
                  setConfirmReset(false);
                  push("Workspace reset to defaults");
                }}
              >
                Yes, reset everything
              </button>
            </>
          )}
        </div>
        <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 10 }}>
          Your data lives in a Neon Postgres database. Export regularly if it
          matters.
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{label}</div>
        <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 2 }}>
          {sub}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 34,
        height: 20,
        borderRadius: 99,
        border: "none",
        background: on ? "var(--text)" : "var(--border-strong)",
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 17 : 3,
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}
