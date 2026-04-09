import { useMemo } from "react";

type TaskInstance = {
  id: number;
  task_id: number;
  title: string;
  status: "PENDING" | "DONE";
  scheduled_date: string;
};

type Props = {
  instances: TaskInstance[];
  onUpdate?: (id: number, status: "DONE" | "PENDING") => Promise<void>;
};

export default function WeeklyTaskList({ instances, onUpdate }: Props) {

  const todo = useMemo(
    () => instances.filter(t => t.status === "PENDING"),
    [instances]
  );

  const completed = useMemo(
    () => instances.filter(t => t.status === "DONE"),
    [instances]
  );

  async function handleUpdate(id: number, status: "DONE" | "PENDING") {
    if (onUpdate) {
      await onUpdate(id, status);
    } else {
      // fallback (direct API call)
      await fetch(`/api/task-instances/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          completed_date: status === "DONE" ? new Date().toISOString() : null,
        }),
      });
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "2rem" }}>

      {/* TODO */}
      <div>
        <h3>To Do</h3>

        {todo.map(task => (
          <div
            key={task.id}
            style={{
              background: "#222",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "6px",
            }}
          >
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleUpdate(task.id, "DONE")}
              />
              {task.title}
            </label>

            <small>{new Date(task.scheduled_date).toDateString()}</small>
          </div>
        ))}
      </div>

      {/* COMPLETED */}
      <div>
        <h3>Completed</h3>

        {completed.map(task => (
          <div
            key={task.id}
            style={{
              background: "#1f3d2b",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "6px",
              color: "#c8f7c5",
              textDecoration: "line-through",
            }}
          >
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={true}
                onChange={() => handleUpdate(task.id, "PENDING")}
              />
              {task.title}
            </label>

            <small>{new Date(task.scheduled_date).toDateString()}</small>
          </div>
        ))}
      </div>

    </div>
  );
}