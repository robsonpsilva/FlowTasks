"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/app/ui/components/button";
import Modal from "@/app/ui/components/modal";
import AddTaskForm from "@/app/ui/components/tasksForms/AddTaskForm";
import styles from '@/app/ui/components/componentStyles/tasksPage.module.css';
import TasksTable from "@/app/ui/components/tasksTable/TasksTable";


export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
  const res = await fetch("/api/tasks");
  const data = await res.json();
  setTasks(data);
}, []);

  // Load on page load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function handleTaskCreated(task: any) {
    console.log('New task:', task);
    setOpen(false); 
  }

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
    setTitle(task.title);     
    setEditingId(task.id);   
    setOpen(true);
  }
  

  // DELETE
  function handleDeleteClick(id: number) {
    setTaskToDelete(id); // open modal
}

function cancelDelete() {
  setTaskToDelete(null);
}

async function confirmDelete() {
  if (!taskToDelete) return;

  await fetch(`/api/tasks/${taskToDelete}`, {
    method: "DELETE",
  });

  setTaskToDelete(null); // close modal
  loadTasks();
}


  return (
    <>

      <section style={{ flex: 1, padding: "20px" }}>
        <h1 className={styles.pageTitle}>My Tasks</h1>
      </section>

{/* Create confirmation modal */}
     <div className={styles.addButtonContainer}>
      <Button type="button" onClick={() => setOpen(true)} className={styles.newTaskbtn}>
        + New Task
      </Button>
     </div>
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit Task" : "Create Task"}
      >
        <AddTaskForm open={open} onTaskCreated={handleTaskCreated} />
      </Modal>

{/* Delete confirmation modal */}
{taskToDelete !== null && (
      <Modal
        open={taskToDelete !== null}
        onClose={cancelDelete}
        title="Confirm Delete"
      >
      <p>Are you sure you want to delete this task?</p>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button onClick={cancelDelete}>Cancel</Button>
        <Button onClick={confirmDelete} className={styles.deleteButton}>
          Delete
        </Button>
      </div>
    </Modal>
    )}

    <section style={{ flex: 1, padding: "20px" }}>
       <TasksTable tasks={tasks} handleEdit={handleEdit} handleDelete={handleDeleteClick} /> 
    </section>

    </>
  );
}
