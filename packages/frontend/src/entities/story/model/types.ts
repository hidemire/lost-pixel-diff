export enum StoryKind {
  Diff = "diff",
  Current = "current",
  Baseline = "baseline",
}

export type Story = {
  id: string;
  kind: StoryKind;
  src: string;
};
