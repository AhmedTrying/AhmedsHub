"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { CommandPalette } from "@/components/CommandPalette";
import { NewProjectModal } from "@/components/modals/NewProjectModal";
import { NewRateModal } from "@/components/modals/NewRateModal";
import { NewNoteModal } from "@/components/modals/NewNoteModal";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

function useCrumbs(pathname: string): string[] {
  const projects = useStore((s) => s.projects);
  const estimates = useStore((s) => s.estimates);

  if (pathname === "/") return ["Workspace", "Dashboard"];
  if (pathname === "/projects") return ["Workspace", "Projects"];
  if (pathname.startsWith("/projects/")) {
    const id = pathname.split("/")[2];
    const p = projects.find((x) => x.id === id);
    return ["Workspace", "Projects", p?.name ?? "Project"];
  }
  if (pathname.startsWith("/estimates/")) {
    const id = pathname.split("/")[2];
    const e = estimates.find((x) => x.id === id);
    return ["Workspace", "Estimate Builder", e?.name ?? "Estimate"];
  }
  if (pathname === "/rates") return ["Workspace", "Rate Library"];
  if (pathname === "/rfqs") return ["Workspace", "RFQ Tracker"];
  if (pathname === "/site-visits") return ["Field & Notes", "Site Visit"];
  if (pathname === "/notes") return ["Field & Notes", "Notes"];
  if (pathname === "/templates") return ["Field & Notes", "Templates"];
  if (pathname === "/settings") return ["Personal", "Settings"];
  return ["Workspace"];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const crumbs = useCrumbs(pathname);
  const theme = useStore((s) => s.settings.theme);
  const hydrated = useStore((s) => s.hydrated);
  const init = useStore((s) => s.init);

  // Single round-trip to Neon hydrates the entire client store.
  useEffect(() => {
    init();
  }, [init]);

  const {
    paletteOpen,
    setPaletteOpen,
    newProjectOpen,
    setNewProjectOpen,
    newRateOpen,
    setNewRateOpen,
    newNoteOpen,
    setNewNoteOpen,
  } = useUI();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useUI.getState().paletteOpen);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setPaletteOpen]);

  return (
    <div className="app" style={{ visibility: hydrated ? "visible" : "hidden" }}>
      <Sidebar />
      <div className="main">
        <Topbar
          crumbs={crumbs}
          onOpenPalette={() => setPaletteOpen(true)}
          onNew={() => setPaletteOpen(true)}
        />
        {children}
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        openNewProject={() => setNewProjectOpen(true)}
        openNewRate={() => setNewRateOpen(true)}
        openNewNote={() => setNewNoteOpen(true)}
      />
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
      <NewRateModal
        open={newRateOpen}
        onClose={() => setNewRateOpen(false)}
      />
      <NewNoteModal
        open={newNoteOpen}
        onClose={() => setNewNoteOpen(false)}
      />
    </div>
  );
}
