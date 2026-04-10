import { Task, TaskStatus } from "../types/task";

export type TaskInstance = {
  id: number; // only for DB / persisted records
  task_id: number;
  scheduled_date: string;
  title: string;
  status: TaskStatus;
  priority: string;
};

/**
 * BEFORE DB INSERT (NO id)
 */
export type TaskInstanceCreate = Omit<TaskInstance, "id">;

export function generateTaskInstances(
  task: Task,
  rangeStart: string | Date,
  rangeEnd: string | Date
): TaskInstanceCreate[] {
  const results: TaskInstanceCreate[] = [];

  if (!task?.schedule?.start_date || !task?.schedule?.frequency) {
    return [];
  }

  const from = new Date(rangeStart);
  const to = new Date(rangeEnd);

  const start = new Date(task.schedule.start_date);
  const end = task.schedule.end_date
    ? new Date(task.schedule.end_date)
    : to;

  const actualStart = start > from ? start : from;
  const actualEnd = end < to ? end : to;

  if (actualStart > actualEnd) {
    return [];
  }

  const days = task.schedule.days_of_week ?? [];

  let current = new Date(actualStart);

  while (current <= actualEnd) {
    const dayOfWeek = current.getDay();

    if (task.schedule.frequency === "DAILY") {
      results.push(makeInstance(task, current));
    }

    if (
      task.schedule.frequency === "WEEKLY" &&
      days.includes(dayOfWeek)
    ) {
      results.push(makeInstance(task, current));
    }

    current.setDate(current.getDate() + 1);
  }

  return results;
}

function makeInstance(task: Task, date: Date): TaskInstanceCreate {
  return {
    task_id: task.id,
    scheduled_date: date.toISOString().split("T")[0],
    title: task.title,
    status: task.status || "PENDING",
    priority: task.priority || "MEDIUM",
  };
}