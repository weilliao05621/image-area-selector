import { create } from "zustand";

// utils
import { generatePreviewData } from "./utils";

// types
import type { Selection, SelectionId } from "@/types/selection.type";
import type { PreviewData } from "./types";

interface Store {
  imageAspectRadio: number;
  selections: Array<Selection>;
  selectionLength: number;
  getSelection: (selectionId: SelectionId) => Selection;
  getSelectionIndex: (selectionId: SelectionId) => number;
  setImageAspectRatio: (ratio: number) => void;
  setSelection: (selection: Selection) => void;
  updateSelection: (selection: Selection) => void;
  deleteSelection: (id: SelectionId) => void;
  getPreviewData: (selection: Omit<Selection, "id">) => PreviewData;
}

const useSelectionStore = create<Store>((set, get) => ({
  imageAspectRadio: 0,
  selections: [],
  selectionLength: 0, // for index

  setImageAspectRatio: (ratio) => {
    set((state) => ({
      ...state,
      imageAspectRadio: ratio,
    }));
  },
  getSelection: (selectionId) =>
    get().selections.find((s) => s.id === selectionId)!,
  getSelectionIndex: (selectionId) =>
    get().selections.findIndex((s) => s.id === selectionId) + 1,
  setSelection: (selection) => {
    set((state) => ({
      ...state,
      selections: [...state.selections, selection],
      selectionLength: state.selectionLength + 1,
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
      selectionLength: state.selectionLength - 1,
    }));
  },

  // convert selection for display
  getPreviewData: (selection) =>
    generatePreviewData(selection, get().imageAspectRadio),
}));

export default useSelectionStore;
