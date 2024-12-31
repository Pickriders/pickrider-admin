export type Entry = {
  day: string;
  completed: number | null;
  rejected: number | null;
  cancelled: number | null;
  missed: number | null;
};

export type Status = "completed" | "rejected" | "cancelled" | "missed";

export type StatusParams = {
  [key in Status]: boolean;
};
