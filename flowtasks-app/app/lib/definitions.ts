export interface Task {
  id: string;
  title: string;
  date: string; // "2026-03-23"
}

export interface TaskTableRow {
  id: number;
  title: string;
  status: string;
}