import { create } from "zustand";

type State = {
  output: string[];
};

type Actions = {
  append: (line: string) => void;
  clear: () => void;
};

export const useGeneratorOutput = create<State & Actions>((set) => ({
  output: [],
  append: (line: string) =>
    set((state) => ({ output: [...state.output, line] })),
  clear: () => set({ output: [] }),
}));
