import { Task } from "../types/task";

export type TaskInstance = {
  task_id: number;
  date: string;
  title: string;
  status: string;
  priority: string;
};

export function generateTaskInstances(
  task: Task,
  rangeStart: string | Date,
  rangeEnd: string | Date
): TaskInstance[] {
  const results: TaskInstance[] = [];

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

function makeInstance(task: Task, date: Date): TaskInstance {
  return {
    task_id: task.id,
    date: date.toISOString().split("T")[0],
    title: task.title,
    status: task.status,
    priority: task.priority,
  };
}


