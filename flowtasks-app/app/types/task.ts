export type TaskStatus = "PENDING" | "DONE";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";

export type TaskSchedule = {
  frequency: "DAILY" | "WEEKLY";
  days_of_week: number[];
  start_date: string;
  end_date: string | null;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  is_active: boolean;
  category_id: number;
  schedule: TaskSchedule;
};