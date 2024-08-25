import { create } from "zustand";

// utils
import { generateSelectedAreaData } from "./utils";

// types
import {
  Selection,
  SelectionId,
} from "@/features/image-area-selector/types/selection.type";
import { SelectedAreaData } from "./types";

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
  getSelectedAreaData: (selection: Omit<Selection, "id">) => SelectedAreaData;
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
  getSelectedAreaData: (selection) =>
    generateSelectedAreaData(selection, get().imageAspectRadio),
}));

export default useSelectionStore;
