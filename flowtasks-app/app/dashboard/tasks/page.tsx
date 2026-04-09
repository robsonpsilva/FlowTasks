"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/app/ui/components/button";
import Modal from "@/app/ui/components/modal";
import TaskForm from "@/app/ui/components/tasksForms/TaskForm";
import styles from '@/app/ui/components/componentStyles/tasksPage.module.css';
import { TaskWithSchedule } from "@/app/lib/formsHelper";
import TasksList from "@/app/ui/components/taskList/TaskList";
import {useIsMobile } from "@/app/ui/components/screenSize";


export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<TaskWithSchedule | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const isMobile = useIsMobile();

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

  function handleTaskSaved(task: any) {
    console.log('New task:', task);
    setOpen(false); 
    setEditingTask(null);
    loadTasks();
  }


  // EDIT (open modal with existing data)
  function handleEdit(task: any) {
    setEditingTask(task);
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
      <Button type="button" onClick={() => {
            setEditingTask(null); 
            setOpen(true);
            }} className={styles.newTaskbtn}>
        + New Task
      </Button>
     </div>
      
      <Modal
        open={open}
        onClose={() => {
            setOpen(false);
            setEditingTask(null);
            }}
        title={editingTask ? "Edit Task" : "Create Task"}
      >
         <TaskForm
            mode={editingTask ? 'edit' : 'create'}
            initialData={editingTask}
            open={open}
            onSuccess={handleTaskSaved}
          />
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

        <TasksList
          tasks={tasks}
          handleEdit={handleEdit}
          handleDelete={handleDeleteClick}
        />

    </>
  );
}
