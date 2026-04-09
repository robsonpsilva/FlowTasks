import { TaskInstance } from "./taskInstances";

export function groupTaskInstancesByDate(instances: TaskInstance[]) {
  const grouped = instances.reduce<Record<string, TaskInstance[]>>(
    (acc, item) => {
      const key = new Date(item.scheduled_date)
        .toISOString()
        .split("T")[0];

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    },
    {}
  );

  return Object.keys(grouped)
    .sort()
    .reduce<Record<string, TaskInstance[]>>((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});
}