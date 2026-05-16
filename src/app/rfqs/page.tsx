"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Filter, Plus, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { useToast } from "@/components/Toast";
import { Pill } from "@/components/Pill";
import { fmtAED } from "@/lib/format";
import { statusTint, priorityDot, statusOptions } from "@/lib/tints";
import type { ProjectStatus, Priority } from "@/lib/types";

type Card = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  value: number;
  priority: Priority;
  dueDate: string;
  next: string;
  origin: "project" | "rfq";
};

function KCard({ p }: { p: Card }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: p.id,
    data: { card: p },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={"kcard" + (isDragging ? " dragging" : "")}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            marginTop: 6,
            background: priorityDot[p.priority],
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div className="ktitle">{p.name}</div>
          <div className="kclient">{p.client}</div>
        </div>
      </div>
      {p.next && (
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-2)",
            marginBottom: 8,
            padding: "5px 7px",
            background: "var(--surface-2)",
            borderRadius: 4,
            borderLeft: "2px solid var(--border-strong)",
          }}
        >
          {p.next}
        </div>
      )}
      <div className="kmeta">
        <Clock size={11} />
        <span>{p.dueDate}</span>
        <div style={{ flex: 1 }} />
        {p.value > 0 && <span className="mono">{fmtAED(p.value)}</span>}
      </div>
    </div>
  );
}

function KColumn({
  col,
  cards,
}: {
  col: ProjectStatus;
  cards: Card[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col });
  return (
    <div
      ref={setNodeRef}
      className="kcol"
      style={
        isOver
          ? { borderColor: "var(--accent)", background: "var(--accent-soft)" }
          : {}
      }
    >
      <div className="kcol-h">
        <Pill tone={statusTint[col]} dot>
          {col}
        </Pill>
        <span className="count">{cards.length}</span>
      </div>
      <div className="kcol-body">
        {cards.map((c) => (
          <KCard key={c.id} p={c} />
        ))}
        {cards.length === 0 && (
          <div
            style={{
              padding: "20px 8px",
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: 11.5,
              border: "1px dashed var(--border)",
              borderRadius: 6,
            }}
          >
            Drop card here
          </div>
        )}
      </div>
    </div>
  );
}

export default function RFQTrackerPage() {
  const projects = useStore((s) => s.projects);
  const rfqs = useStore((s) => s.rfqs);
  const moveProjectStatus = useStore((s) => s.moveProjectStatus);
  const moveRfq = useStore((s) => s.moveRfq);
  const { push } = useToast();
  const { setNewProjectOpen } = useUI();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const cards: Card[] = useMemo(
    () => [
      ...projects.map<Card>((p) => ({
        id: p.id,
        name: p.name,
        client: p.client,
        status: p.status,
        value: p.value,
        priority: p.priority,
        dueDate: p.dueDate,
        next: p.next,
        origin: "project",
      })),
      ...rfqs.map<Card>((r) => ({
        id: r.id,
        name: r.name,
        client: r.client,
        status: r.status,
        value: r.value,
        priority: r.priority,
        dueDate: r.dueDate,
        next: r.next,
        origin: "rfq",
      })),
    ],
    [projects, rfqs]
  );

  const byCol = useMemo(() => {
    const m = {} as Record<ProjectStatus, Card[]>;
    statusOptions.forEach((s) => (m[s] = []));
    cards.forEach((c) => m[c.status].push(c));
    return m;
  }, [cards]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id;
    if (!over) return;
    const target = over as ProjectStatus;
    const id = String(e.active.id);
    const card = cards.find((c) => c.id === id);
    if (!card || card.status === target) return;
    if (card.origin === "project") {
      moveProjectStatus(id, target);
    } else {
      moveRfq(id, target);
    }
    push(`Moved "${card.name}" → ${target}`);
  };

  return (
    <div
      className="page wide"
      style={{ maxWidth: "none", paddingLeft: 24, paddingRight: 24 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="page-title">RFQ / Quotation Tracker</h1>
          <p className="page-sub">
            Drag cards between columns to update status. {cards.length} active
            RFQs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn">
            <Filter size={14} /> Filter
          </button>
          <button
            className="btn primary"
            onClick={() => setNewProjectOpen(true)}
          >
            <Plus size={14} /> New RFQ
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="kanban" style={{ marginTop: 16 }}>
          {statusOptions.map((col) => (
            <KColumn key={col} col={col} cards={byCol[col]} />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <KCard p={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
