"use client";

import { create } from "zustand";
import type {
  Client,
  Project,
  Estimate,
  EstimateItem,
  RateItem,
  Note,
  SiteVisit,
  ChecklistItem,
  RFQ,
  Template,
  Settings,
  ActivityItem,
  ProjectStatus,
  ProjectTask,
} from "./types";
import { seedSettings } from "./seed";
import { newId } from "./format";
import { toast } from "./toastBus";

/* ============================ fetch helper ============================ */

async function api<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

/* ============================ store shape ============================ */

interface DataState {
  hydrated: boolean;

  clients: Client[];
  projects: Project[];
  estimates: Estimate[];
  estimateItems: EstimateItem[];
  rates: RateItem[];
  notes: Note[];
  siteVisits: SiteVisit[];
  checklistItems: ChecklistItem[];
  rfqs: RFQ[];
  templates: Template[];
  activity: ActivityItem[];
  projectTasks: ProjectTask[];
  settings: Settings;

  activeEstimateId: string | null;
  setActiveEstimateId: (id: string | null) => void;

  init: () => Promise<void>;

  addProject: (p: Omit<Project, "id" | "createdAt">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  togglePinProject: (id: string) => void;

  addEstimate: (e: Omit<Estimate, "id" | "createdAt" | "updatedAt">) => Estimate;
  updateEstimate: (id: string, patch: Partial<Estimate>) => void;

  addEstimateItem: (item: Omit<EstimateItem, "id">) => EstimateItem;
  updateEstimateItem: (id: string, patch: Partial<EstimateItem>) => void;
  duplicateEstimateItem: (id: string) => void;
  deleteEstimateItem: (id: string) => void;
  addRatesToEstimate: (estimateId: string, rateIds: string[]) => number;

  addRate: (r: Omit<RateItem, "id" | "last">) => RateItem;
  updateRate: (id: string, patch: Partial<RateItem>) => void;
  deleteRate: (id: string) => void;

  addNote: (n: Omit<Note, "id" | "createdAt" | "when">) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;

  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (siteVisitId: string, group: string, text: string) => void;
  updateSiteVisit: (id: string, patch: Partial<SiteVisit>) => void;

  moveRfq: (id: string, status: ProjectStatus) => void;
  moveProjectStatus: (id: string, status: ProjectStatus) => void;

  addProjectTask: (projectId: string, text: string) => ProjectTask;
  toggleProjectTask: (id: string) => void;
  updateProjectTask: (id: string, patch: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;

  pushActivity: (a: Omit<ActivityItem, "id" | "at" | "when">) => void;

  updateSettings: (patch: Partial<Settings>) => void;

  exportJSON: () => string;
  importJSON: (raw: string) => Promise<boolean>;
  resetWorkspace: () => Promise<void>;
}

/* ============================ store ============================ */

export const useStore = create<DataState>()((set, get) => ({
  hydrated: false,

  clients: [],
  projects: [],
  estimates: [],
  estimateItems: [],
  rates: [],
  notes: [],
  siteVisits: [],
  checklistItems: [],
  rfqs: [],
  templates: [],
  activity: [],
  projectTasks: [],
  settings: seedSettings,

  activeEstimateId: null,
  setActiveEstimateId: (id) => {
    set({ activeEstimateId: id });
    void api(`/api/app-state/activeEstimateId`, {
      method: "PATCH",
      body: JSON.stringify({ value: id }),
    }).catch(() => toast("Couldn't save active estimate"));
  },

  init: async () => {
    try {
      const data = await api<{
        clients: Client[];
        projects: Project[];
        estimates: Estimate[];
        estimateItems: EstimateItem[];
        rates: RateItem[];
        notes: Note[];
        siteVisits: SiteVisit[];
        checklistItems: ChecklistItem[];
        rfqs: RFQ[];
        templates: Template[];
        activity: ActivityItem[];
        projectTasks: ProjectTask[];
        settings: Settings | null;
        activeEstimateId: string | null;
      }>("/api/state");

      set({
        clients: data.clients,
        projects: data.projects,
        estimates: data.estimates,
        estimateItems: data.estimateItems,
        rates: data.rates,
        notes: data.notes,
        siteVisits: data.siteVisits,
        checklistItems: data.checklistItems,
        rfqs: data.rfqs,
        templates: data.templates,
        activity: data.activity,
        projectTasks: data.projectTasks,
        settings: data.settings ?? seedSettings,
        activeEstimateId: data.activeEstimateId,
        hydrated: true,
      });
    } catch (e) {
      console.error("[store init]", e);
      toast("Couldn't load workspace");
      set({ hydrated: true });
    }
  },

  /* -------- projects -------- */
  addProject: (p) => {
    const project: Project = {
      ...p,
      id: newId("p"),
      createdAt: Date.now(),
    };
    set((s) => ({ projects: [project, ...s.projects] }));
    void api("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    })
      .then((real) => {
        const r = real as Project;
        set((s) => ({
          projects: s.projects.map((x) => (x.id === project.id ? r : x)),
        }));
      })
      .catch(() => {
        set((s) => ({ projects: s.projects.filter((x) => x.id !== project.id) }));
        toast("Failed to create project");
      });
    get().pushActivity({
      who: "You",
      what: "created project",
      on: project.name,
      icon: "projects",
    });
    return project;
  },
  updateProject: (id, patch) => {
    const prev = get().projects.find((p) => p.id === id);
    if (!prev) return;
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...patch, updated: "just now" } : p
      ),
    }));
    void api(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? prev : p)),
      }));
      toast("Update failed");
    });
  },
  deleteProject: (id) => {
    const prev = get().projects.find((p) => p.id === id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    void api(`/api/projects/${id}`, { method: "DELETE" }).catch(() => {
      if (prev) set((s) => ({ projects: [prev, ...s.projects] }));
      toast("Delete failed");
    });
  },
  togglePinProject: (id) => {
    const prev = get().projects.find((p) => p.id === id);
    if (!prev) return;
    const nextPinned = !prev.pinned;
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, pinned: nextPinned } : p
      ),
    }));
    void api(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ pinned: nextPinned }),
    }).catch(() => {
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? prev : p)),
      }));
      toast("Pin failed");
    });
  },

  /* -------- estimates -------- */
  addEstimate: (e) => {
    const est: Estimate = {
      ...e,
      id: newId("est"),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ estimates: [est, ...s.estimates] }));
    void api("/api/estimates", {
      method: "POST",
      body: JSON.stringify(est),
    }).catch(() => {
      set((s) => ({ estimates: s.estimates.filter((x) => x.id !== est.id) }));
      toast("Failed to create estimate");
    });
    return est;
  },
  updateEstimate: (id, patch) => {
    const prev = get().estimates.find((e) => e.id === id);
    if (!prev) return;
    set((s) => ({
      estimates: s.estimates.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
      ),
    }));
    void api(`/api/estimates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({ estimates: s.estimates.map((e) => (e.id === id ? prev : e)) }));
      toast("Estimate update failed");
    });
  },

  /* -------- estimate items -------- */
  addEstimateItem: (item) => {
    const row: EstimateItem = { ...item, id: newId("ei") };
    set((s) => ({ estimateItems: [...s.estimateItems, row] }));
    void api("/api/estimate-items", {
      method: "POST",
      body: JSON.stringify(row),
    }).catch(() => {
      set((s) => ({
        estimateItems: s.estimateItems.filter((r) => r.id !== row.id),
      }));
      toast("Failed to add line item");
    });
    return row;
  },
  updateEstimateItem: (id, patch) => {
    const prev = get().estimateItems.find((r) => r.id === id);
    if (!prev) return;
    set((s) => ({
      estimateItems: s.estimateItems.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));
    // Debounce PATCH? For now: fire on every keystroke. Adequate for personal app.
    void api(`/api/estimate-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({
        estimateItems: s.estimateItems.map((r) => (r.id === id ? prev : r)),
      }));
      toast("Edit didn't save");
    });
  },
  duplicateEstimateItem: (id) => {
    const idx = get().estimateItems.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const source = get().estimateItems[idx];
    const clone: EstimateItem = {
      ...source,
      id: newId("ei"),
      item: source.item + "·",
    };
    set((s) => {
      const next = [...s.estimateItems];
      next.splice(idx + 1, 0, clone);
      return { estimateItems: next };
    });
    void api("/api/estimate-items", {
      method: "POST",
      body: JSON.stringify(clone),
    }).catch(() => {
      set((s) => ({
        estimateItems: s.estimateItems.filter((r) => r.id !== clone.id),
      }));
      toast("Duplicate failed");
    });
  },
  deleteEstimateItem: (id) => {
    const prev = get().estimateItems.find((r) => r.id === id);
    set((s) => ({
      estimateItems: s.estimateItems.filter((r) => r.id !== id),
    }));
    void api(`/api/estimate-items/${id}`, { method: "DELETE" }).catch(() => {
      if (prev) set((s) => ({ estimateItems: [...s.estimateItems, prev] }));
      toast("Delete failed");
    });
  },
  addRatesToEstimate: (estimateId, rateIds) => {
    const state = get();
    const newRows: EstimateItem[] = [];
    rateIds.forEach((rid) => {
      const r = state.rates.find((x) => x.id === rid);
      if (!r) return;
      newRows.push({
        id: newId("ei"),
        estimateId,
        item: `R-${state.estimateItems.length + newRows.length + 1}`,
        desc: r.name,
        category: r.category,
        unit: r.unit,
        qty: 1,
        cost: r.rate,
        markup: state.settings.defaultMarkup,
        notes: r.notes,
      });
    });
    if (newRows.length === 0) return 0;
    set((s) => ({ estimateItems: [...s.estimateItems, ...newRows] }));
    void api("/api/estimate-items/bulk", {
      method: "POST",
      body: JSON.stringify({ items: newRows }),
    }).catch(() => {
      const ids = new Set(newRows.map((r) => r.id));
      set((s) => ({
        estimateItems: s.estimateItems.filter((r) => !ids.has(r.id)),
      }));
      toast("Couldn't add rates");
    });
    return newRows.length;
  },

  /* -------- rates -------- */
  addRate: (r) => {
    const rate: RateItem = {
      ...r,
      id: newId("r"),
      last: new Date().toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      }),
    };
    set((s) => ({ rates: [rate, ...s.rates] }));
    void api("/api/rates", {
      method: "POST",
      body: JSON.stringify(rate),
    }).catch(() => {
      set((s) => ({ rates: s.rates.filter((x) => x.id !== rate.id) }));
      toast("Failed to save rate");
    });
    get().pushActivity({
      who: "You",
      what: "added rate",
      on: rate.name,
      icon: "rates",
    });
    return rate;
  },
  updateRate: (id, patch) => {
    const prev = get().rates.find((r) => r.id === id);
    if (!prev) return;
    set((s) => ({ rates: s.rates.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    void api(`/api/rates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({ rates: s.rates.map((r) => (r.id === id ? prev : r)) }));
      toast("Rate update failed");
    });
  },
  deleteRate: (id) => {
    const prev = get().rates.find((r) => r.id === id);
    set((s) => ({ rates: s.rates.filter((r) => r.id !== id) }));
    void api(`/api/rates/${id}`, { method: "DELETE" }).catch(() => {
      if (prev) set((s) => ({ rates: [prev, ...s.rates] }));
      toast("Delete failed");
    });
  },

  /* -------- notes -------- */
  addNote: (n) => {
    const note: Note = {
      ...n,
      id: newId("n"),
      createdAt: Date.now(),
      when: "just now",
    };
    set((s) => ({ notes: [note, ...s.notes] }));
    void api("/api/notes", {
      method: "POST",
      body: JSON.stringify(note),
    }).catch(() => {
      set((s) => ({ notes: s.notes.filter((x) => x.id !== note.id) }));
      toast("Note save failed");
    });
    return note;
  },
  updateNote: (id, patch) => {
    const prev = get().notes.find((n) => n.id === id);
    if (!prev) return;
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));
    void api(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({ notes: s.notes.map((n) => (n.id === id ? prev : n)) }));
      toast("Note update failed");
    });
  },
  togglePinNote: (id) => {
    const prev = get().notes.find((n) => n.id === id);
    if (!prev) return;
    const nextPinned = !prev.pinned;
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: nextPinned } : n)),
    }));
    void api(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ pinned: nextPinned }),
    }).catch(() => {
      set((s) => ({ notes: s.notes.map((n) => (n.id === id ? prev : n)) }));
      toast("Pin failed");
    });
  },
  deleteNote: (id) => {
    const prev = get().notes.find((n) => n.id === id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    void api(`/api/notes/${id}`, { method: "DELETE" }).catch(() => {
      if (prev) set((s) => ({ notes: [prev, ...s.notes] }));
      toast("Delete failed");
    });
  },

  /* -------- checklist + site visit -------- */
  toggleChecklistItem: (id) => {
    const prev = get().checklistItems.find((c) => c.id === id);
    if (!prev) return;
    const nextDone = !prev.done;
    set((s) => ({
      checklistItems: s.checklistItems.map((c) =>
        c.id === id ? { ...c, done: nextDone } : c
      ),
    }));
    void api(`/api/checklist-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: nextDone }),
    }).catch(() => {
      set((s) => ({
        checklistItems: s.checklistItems.map((c) => (c.id === id ? prev : c)),
      }));
      toast("Toggle failed");
    });
  },
  addChecklistItem: (siteVisitId, group, text) => {
    const item: ChecklistItem = {
      id: newId("ck"),
      siteVisitId,
      group,
      text,
      done: false,
    };
    set((s) => ({ checklistItems: [...s.checklistItems, item] }));
    void api("/api/checklist-items", {
      method: "POST",
      body: JSON.stringify(item),
    }).catch(() => {
      set((s) => ({
        checklistItems: s.checklistItems.filter((c) => c.id !== item.id),
      }));
      toast("Couldn't add checklist item");
    });
  },
  updateSiteVisit: (id, patch) => {
    const prev = get().siteVisits.find((sv) => sv.id === id);
    if (!prev) return;
    set((s) => ({
      siteVisits: s.siteVisits.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)),
    }));
    void api(`/api/site-visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({
        siteVisits: s.siteVisits.map((sv) => (sv.id === id ? prev : sv)),
      }));
      toast("Site-visit save failed");
    });
  },

  /* -------- RFQ / project status -------- */
  moveRfq: (id, status) => {
    const prev = get().rfqs.find((r) => r.id === id);
    if (!prev) return;
    set((s) => ({
      rfqs: s.rfqs.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    void api(`/api/rfqs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).catch(() => {
      set((s) => ({ rfqs: s.rfqs.map((r) => (r.id === id ? prev : r)) }));
      toast("Move failed");
    });
  },
  moveProjectStatus: (id, status) => {
    const prev = get().projects.find((p) => p.id === id);
    if (!prev) return;
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, status, updated: "just now" } : p
      ),
    }));
    void api(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).catch(() => {
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? prev : p)) }));
      toast("Move failed");
    });
  },

  /* -------- project tasks -------- */
  addProjectTask: (projectId, text) => {
    const task: ProjectTask = {
      id: newId("pt"),
      projectId,
      text,
      done: false,
      createdAt: Date.now(),
    };
    set((s) => ({ projectTasks: [...s.projectTasks, task] }));
    void api("/api/project-tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }).catch(() => {
      set((s) => ({
        projectTasks: s.projectTasks.filter((t) => t.id !== task.id),
      }));
      toast("Couldn't add task");
    });
    return task;
  },
  toggleProjectTask: (id) => {
    const prev = get().projectTasks.find((t) => t.id === id);
    if (!prev) return;
    const nextDone = !prev.done;
    set((s) => ({
      projectTasks: s.projectTasks.map((t) =>
        t.id === id ? { ...t, done: nextDone } : t
      ),
    }));
    void api(`/api/project-tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: nextDone }),
    }).catch(() => {
      set((s) => ({
        projectTasks: s.projectTasks.map((t) => (t.id === id ? prev : t)),
      }));
      toast("Toggle failed");
    });
  },
  updateProjectTask: (id, patch) => {
    const prev = get().projectTasks.find((t) => t.id === id);
    if (!prev) return;
    set((s) => ({
      projectTasks: s.projectTasks.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    }));
    void api(`/api/project-tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set((s) => ({
        projectTasks: s.projectTasks.map((t) => (t.id === id ? prev : t)),
      }));
      toast("Task update failed");
    });
  },
  deleteProjectTask: (id) => {
    const prev = get().projectTasks.find((t) => t.id === id);
    set((s) => ({
      projectTasks: s.projectTasks.filter((t) => t.id !== id),
    }));
    void api(`/api/project-tasks/${id}`, { method: "DELETE" }).catch(() => {
      if (prev) set((s) => ({ projectTasks: [...s.projectTasks, prev] }));
      toast("Delete failed");
    });
  },

  /* -------- activity -------- */
  pushActivity: (a) => {
    const item: ActivityItem = {
      ...a,
      id: newId("a"),
      at: Date.now(),
      when: "just now",
    };
    set((s) => ({ activity: [item, ...s.activity].slice(0, 30) }));
    void api("/api/activity", {
      method: "POST",
      body: JSON.stringify(item),
    }).catch(() => {
      /* activity is best-effort; no UI toast */
    });
  },

  /* -------- settings -------- */
  updateSettings: (patch) => {
    const prev = get().settings;
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    void api("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).catch(() => {
      set({ settings: prev });
      toast("Settings save failed");
    });
  },

  /* -------- bulk: export / import / reset -------- */
  exportJSON: () => {
    const s = get();
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          clients: s.clients,
          projects: s.projects,
          estimates: s.estimates,
          estimateItems: s.estimateItems,
          rates: s.rates,
          notes: s.notes,
          siteVisits: s.siteVisits,
          checklistItems: s.checklistItems,
          rfqs: s.rfqs,
          templates: s.templates,
          activity: s.activity,
          projectTasks: s.projectTasks,
          settings: s.settings,
        },
      },
      null,
      2
    );
  },
  importJSON: async (raw) => {
    try {
      const parsed = JSON.parse(raw);
      await api("/api/import", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      await get().init();
      return true;
    } catch (e) {
      console.error("[import]", e);
      toast("Import failed");
      return false;
    }
  },
  resetWorkspace: async () => {
    try {
      await api("/api/reset", { method: "POST" });
      await get().init();
    } catch {
      toast("Reset failed");
    }
  },
}));
