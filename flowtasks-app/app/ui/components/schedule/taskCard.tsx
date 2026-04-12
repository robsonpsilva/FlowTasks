import { useState, useEffect } from "react";
import { TaskInstance } from "@/app/services/taskInstances";

export default function TaskCard({ 
  task,
  onUpdate,
}: { 
  task: TaskInstance;
  onUpdate?: (id: number, status: "DONE" | "PENDING") => Promise<void>;
}) {

  const [checked, setChecked] = useState(task.status === "DONE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(task.status === "DONE");
  }, [task.status]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.scheduled_date);
  due.setHours(0, 0, 0, 0);

  const isOverdue = !checked && due < today;

  async function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    setChecked(isChecked); // instant UI
    setLoading(true);

    try {
      if (onUpdate) {
        await onUpdate(task.id, isChecked ? "DONE" : "PENDING");
      }
    } catch (err) {
      console.error(err);
      setChecked(!isChecked); // rollback if failed
    } finally {
      setLoading(false);
    }
  }

  const backgroundColor = checked
    ? "#1f6f3a" // green
    : isOverdue
    ? "#7a1f1f" // red
    : "#1A659E";

  return (
    <div
      style={{
        background: backgroundColor,
        padding: "0.5rem",
        marginTop: "0.5rem",
        borderRadius: "6px",
        opacity: checked ? 0.7 : 1,
        textDecoration: checked ? "line-through" : "none",
      }}
    >
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {task.title}
      </label>
    </div>
  );
}