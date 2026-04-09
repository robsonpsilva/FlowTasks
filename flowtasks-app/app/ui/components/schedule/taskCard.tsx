import { useState } from "react";
import { TaskInstance } from "@/app/services/taskInstances";

export default function TaskCard({ task }: { task: TaskInstance }) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(task.status === "DONE");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.scheduled_date);
  due.setHours(0, 0, 0, 0);

  const isOverdue = !checked && due < today;

  async function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    setChecked(isChecked);
    setLoading(true);

    try {
      await fetch(`/api/task-instances/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: isChecked ? "DONE" : "PENDING",
          completed_date: isChecked ? new Date().toISOString() : null,
        }),
      });
    } catch (err) {
      console.error(err);
      setChecked(!isChecked); // rollback
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
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheck}
          disabled={loading}
        />
        {task.title}
      </label>
    </div>
  );
}