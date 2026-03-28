"use client";

import { useEffect, useState } from "react";
import Button from "@/app/ui/components/button";
import Modal from "@/app/ui/components/modal";

export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch tasks
  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  // Load on page load
  useEffect(() => {
    loadTasks();
  }, []);

  // CREATE TASK
  async function saveTask() {
  if (!title) return;

  if (editingId) {
    // UPDATE
    await fetch(`/api/tasks/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  } else {
    // CREATE
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  }

  setTitle("");
  setEditingId(null);
  setOpen(false);
  loadTasks();
}

  // EDIT (open modal with existing data)
  function handleEdit(task: any) {
    setTitle(task.title);     // reuse your existing state
    setEditingId(task.id);    // new state
    setOpen(true);
  }

  // DELETE
  async function handleDelete(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    loadTasks(); // refresh
  }

  return (
    <>
      <section style={{ flex: 1, padding: "20px" }}>
        <p>This is the tasks page.</p>
        <Button onClick={() => setOpen(true)}>Add Task</Button>
      </section>

      <div>
        <p style={{ fontSize: 40 }}>Tasks (Temporary Header)</p>
        <ul style={{ marginTop: "10px" }}>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title} - {task.status}

              <Button onClick={() => handleEdit(task)}>
                Edit
              </Button>

              <Button onClick={() => handleDelete(task.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Task"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />

          <Button onClick={saveTask}>
            {editingId ? "Update" : "Create"}
          </Button>
        </div>
      </Modal>
    </>
  );
}