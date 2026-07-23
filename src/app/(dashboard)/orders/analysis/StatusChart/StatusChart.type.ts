export type Entry = {
  day: string;
  completed: number | null;
  ongoing: number | null;
  cancelled: number | null;
  pending: number | null;
};

export type Status = "completed" | "ongoing" | "cancelled" | "pending";

export type StatusParams = {
  [key in Status]: boolean;
};
