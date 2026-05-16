"use client";

import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  ArrowRight,
  SprayCan,
  Snowflake,
  Zap,
  Bug,
  ClipboardList,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";
import type { EstimateItem } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  spray: SprayCan,
  snow: Snowflake,
  bolt: Zap,
  bug: Bug,
  clipboard: ClipboardList,
  file: FileText,
};

export default function TemplatesPage() {
  const router = useRouter();
  const templates = useStore((s) => s.templates);
  const projects = useStore((s) => s.projects);
  const settings = useStore((s) => s.settings);
  const addEstimate = useStore((s) => s.addEstimate);
  const addEstimateItem = useStore((s) => s.addEstimateItem);
  const setActiveEstimateId = useStore((s) => s.setActiveEstimateId);
  const { push } = useToast();

  const handleUseTemplate = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    if (tpl.kind === "estimate") {
      const fallbackProject = projects[0];
      const est = addEstimate({
        projectId: fallbackProject?.id ?? "",
        name: `${tpl.name} — Draft`,
        version: "v1 Draft",
        quotationNumber: "QTN-" + Date.now().toString().slice(-6),
        validity: "45 days",
        paymentTerms: "30 days net",
        coverLetter: "Cover letter — edit before sending.",
        includeAssumptions: true,
      });
      // Seed a few rows based on the template kind
      const seedRows: Omit<EstimateItem, "id" | "estimateId">[] = [
        { item: "T-01", desc: "Line item from template", category: "Cleaning", unit: "month", qty: 12, cost: 1000, markup: settings.defaultMarkup, notes: "" },
        { item: "T-02", desc: "Add more items as needed", category: "Manpower", unit: "month", qty: 12, cost: 2000, markup: settings.defaultMarkup, notes: "" },
      ];
      seedRows.forEach((r) => addEstimateItem({ ...r, estimateId: est.id }));
      setActiveEstimateId(est.id);
      push(`Created draft from "${tpl.name}"`);
      router.push(`/estimates/${est.id}`);
    } else {
      push(`Created from "${tpl.name}"`);
    }
  };

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-sub">
            Re-usable starting points so you never build the same estimate
            twice.
          </p>
        </div>
        <button className="btn primary">
          <Plus size={14} /> New template
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 18,
        }}
      >
        {templates.map((t) => {
          const Icon = ICONS[t.icon] ?? FileText;
          return (
            <div key={t.id} className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "var(--surface-2)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    border: "1px solid var(--border)",
                    color: "var(--text-2)",
                  }}
                >
                  <Icon size={18} />
                </div>
                <button className="btn ghost sm">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14.5,
                  marginTop: 14,
                  lineHeight: 1.3,
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  color: "var(--text-2)",
                  fontSize: 12.5,
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {t.desc}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                  {t.rows} rows · used {t.used}×
                </span>
                <button
                  className="btn sm"
                  onClick={() => handleUseTemplate(t.id)}
                >
                  Use <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

