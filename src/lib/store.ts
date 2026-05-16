"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
import {
  seedClients,
  seedProjects,
  seedEstimates,
  seedEstimateItems,
  seedRates,
  seedNotes,
  seedSiteVisits,
  seedChecklistItems,
  seedRfqs,
  seedTemplates,
  seedSettings,
  seedActivity,
  seedProjectTasks,
} from "./seed";
import { newId } from "./format";

interface DataState {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;

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
  importJSON: (raw: string) => boolean;
  resetWorkspace: () => void;
}

const initialState = {
  clients: seedClients,
  projects: seedProjects,
  estimates: seedEstimates,
  estimateItems: seedEstimateItems,
  rates: seedRates,
  notes: seedNotes,
  siteVisits: seedSiteVisits,
  checklistItems: seedChecklistItems,
  rfqs: seedRfqs,
  templates: seedTemplates,
  activity: seedActivity,
  projectTasks: seedProjectTasks,
  settings: seedSettings,
  activeEstimateId: "est_1" as string | null,
};

export const useStore = create<DataState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      ...initialState,

      setActiveEstimateId: (id) => set({ activeEstimateId: id }),

      addProject: (p) => {
        const project: Project = {
          ...p,
          id: newId("p"),
          createdAt: Date.now(),
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        get().pushActivity({
          who: "You",
          what: "created project",
          on: project.name,
          icon: "projects",
        });
        return project;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updated: "just now" } : p
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      togglePinProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, pinned: !p.pinned } : p
          ),
        })),

      addEstimate: (e) => {
        const est: Estimate = {
          ...e,
          id: newId("est"),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ estimates: [est, ...s.estimates] }));
        return est;
      },
      updateEstimate: (id, patch) =>
        set((s) => ({
          estimates: s.estimates.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
          ),
        })),

      addEstimateItem: (item) => {
        const row: EstimateItem = { ...item, id: newId("ei") };
        set((s) => ({ estimateItems: [...s.estimateItems, row] }));
        return row;
      },
      updateEstimateItem: (id, patch) =>
        set((s) => ({
          estimateItems: s.estimateItems.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        })),
      duplicateEstimateItem: (id) =>
        set((s) => {
          const idx = s.estimateItems.findIndex((r) => r.id === id);
          if (idx === -1) return s;
          const clone: EstimateItem = {
            ...s.estimateItems[idx],
            id: newId("ei"),
            item: s.estimateItems[idx].item + "·",
          };
          const next = [...s.estimateItems];
          next.splice(idx + 1, 0, clone);
          return { estimateItems: next };
        }),
      deleteEstimateItem: (id) =>
        set((s) => ({
          estimateItems: s.estimateItems.filter((r) => r.id !== id),
        })),
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
        if (newRows.length > 0) {
          set((s) => ({
            estimateItems: [...s.estimateItems, ...newRows],
          }));
        }
        return newRows.length;
      },

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
        get().pushActivity({
          who: "You",
          what: "added rate",
          on: rate.name,
          icon: "rates",
        });
        return rate;
      },
      updateRate: (id, patch) =>
        set((s) => ({
          rates: s.rates.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteRate: (id) =>
        set((s) => ({ rates: s.rates.filter((r) => r.id !== id) })),

      addNote: (n) => {
        const note: Note = {
          ...n,
          id: newId("n"),
          createdAt: Date.now(),
          when: "just now",
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      togglePinNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      toggleChecklistItem: (id) =>
        set((s) => ({
          checklistItems: s.checklistItems.map((c) =>
            c.id === id ? { ...c, done: !c.done } : c
          ),
        })),
      addChecklistItem: (siteVisitId, group, text) =>
        set((s) => ({
          checklistItems: [
            ...s.checklistItems,
            { id: newId("ck"), siteVisitId, group, text, done: false },
          ],
        })),
      updateSiteVisit: (id, patch) =>
        set((s) => ({
          siteVisits: s.siteVisits.map((sv) =>
            sv.id === id ? { ...sv, ...patch } : sv
          ),
        })),

      moveRfq: (id, status) =>
        set((s) => ({
          rfqs: s.rfqs.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      moveProjectStatus: (id, status) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status, updated: "just now" } : p
          ),
        })),

      addProjectTask: (projectId, text) => {
        const task: ProjectTask = {
          id: newId("pt"),
          projectId,
          text,
          done: false,
          createdAt: Date.now(),
        };
        set((s) => ({ projectTasks: [...s.projectTasks, task] }));
        return task;
      },
      toggleProjectTask: (id) =>
        set((s) => ({
          projectTasks: s.projectTasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      updateProjectTask: (id, patch) =>
        set((s) => ({
          projectTasks: s.projectTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),
      deleteProjectTask: (id) =>
        set((s) => ({
          projectTasks: s.projectTasks.filter((t) => t.id !== id),
        })),

      pushActivity: (a) =>
        set((s) => ({
          activity: [
            {
              ...a,
              id: newId("a"),
              at: Date.now(),
              when: "just now",
            },
            ...s.activity,
          ].slice(0, 30),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

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
      importJSON: (raw) => {
        try {
          const parsed = JSON.parse(raw);
          const d = parsed.data || parsed;
          set((s) => ({
            clients: d.clients ?? s.clients,
            projects: d.projects ?? s.projects,
            estimates: d.estimates ?? s.estimates,
            estimateItems: d.estimateItems ?? s.estimateItems,
            rates: d.rates ?? s.rates,
            notes: d.notes ?? s.notes,
            siteVisits: d.siteVisits ?? s.siteVisits,
            checklistItems: d.checklistItems ?? s.checklistItems,
            rfqs: d.rfqs ?? s.rfqs,
            templates: d.templates ?? s.templates,
            activity: d.activity ?? s.activity,
            projectTasks: d.projectTasks ?? s.projectTasks,
            settings: d.settings ?? s.settings,
          }));
          return true;
        } catch {
          return false;
        }
      },
      resetWorkspace: () => set({ ...initialState, hydrated: true }),
    }),
    {
      name: "ahmeds-hub:v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (s) => ({
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
        activeEstimateId: s.activeEstimateId,
      }),
    }
  )
);
