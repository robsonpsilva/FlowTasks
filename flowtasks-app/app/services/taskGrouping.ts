import { TaskInstance } from "./taskInstances";

export function groupTaskInstancesByDate(instances: TaskInstance[]) {
  const grouped = instances.reduce<Record<string, TaskInstance[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort()
    .reduce<Record<string, TaskInstance[]>>((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});
}