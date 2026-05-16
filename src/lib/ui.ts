"use client";

import { create } from "zustand";

interface UIState {
  newProjectOpen: boolean;
  newRateOpen: boolean;
  newNoteOpen: boolean;
  paletteOpen: boolean;
  setNewProjectOpen: (v: boolean) => void;
  setNewRateOpen: (v: boolean) => void;
  setNewNoteOpen: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  newProjectOpen: false,
  newRateOpen: false,
  newNoteOpen: false,
  paletteOpen: false,
  setNewProjectOpen: (v) => set({ newProjectOpen: v }),
  setNewRateOpen: (v) => set({ newRateOpen: v }),
  setNewNoteOpen: (v) => set({ newNoteOpen: v }),
  setPaletteOpen: (v) => set({ paletteOpen: v }),
}));
