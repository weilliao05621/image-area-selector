import { create } from "zustand";

// utils
import { generatePreviewData } from "./utils";

// types
import type { Selection, SelectionId } from "@/types/selection.type";
import type { PreviewData } from "./types";

interface Store {
  imageAspectRadio: number;
  selections: Array<Selection>;
  setImageAspectRatio: (ratio: number) => void;
  getSelections: () => Array<Selection>;
  setSelection: (selection: Selection) => void;
  updateSelection: (selection: Selection) => void;
  deleteSelection: (id: SelectionId) => void;
  getImageAspectRatio: () => number;
  getPreviewDataList: () => Array<PreviewData>;
}

const useSelectionStore = create<Store>((set, get) => ({
  imageAspectRadio: 0,
  selections: [],

  setImageAspectRatio: (ratio) => {
    set((state) => ({
      ...state,
      imageAspectRadio: ratio,
    }));
  },

  getSelections: () => get().selections,
  setSelection: (selection) => {
    set((state) => ({
      ...state,
      selections: [...state.selections, selection],
    }));
  },
  updateSelection: (selection) => {
    set((state) => ({
      ...state,
      selections: state.selections.map((s) => {
        if (s.id !== selection.id) return s;
        return {
          ...selection,
        };
      }),
    }));
  },

  deleteSelection: (id) => {
    set((state) => ({
      ...state,
      selections: state.selections.filter((s) => s.id !== id),
    }));
  },

  getImageAspectRatio: () => get().imageAspectRadio,

  // convert selections for display
  getPreviewDataList: () =>
    get().selections.map((selection) =>
      generatePreviewData(selection, get().imageAspectRadio),
    ),
}));

export default useSelectionStore;
