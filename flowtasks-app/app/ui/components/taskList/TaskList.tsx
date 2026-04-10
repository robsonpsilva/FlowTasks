import { useState } from "react";
import styles from '../componentStyles/taskList.module.css';
import Button from "../button";
import Pagination from "../tasksTable/Pagination";
const ITEMS_PER_PAGE = 5; 

export default function TasksList({ tasks, handleEdit, handleDelete }: any) {

     const [currentPage, setCurrentPage] = useState<number>(1);
    
      const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
    
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const currentTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
  return (
    <div className={styles.listContainer}>
         <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
      {currentTasks.map((task: any) => (
        <div key={task.id} className={styles.card}>
          <p className={styles.cardStatus}>{task.status}</p>
          <h3 className={styles.cardTitle}>{task.title}</h3>
          <p className={styles.cardDescription}>{task.description}</p>

          <div className={styles.cardFooter}>
            <Button onClick={() => handleEdit(task)} className={styles.editButton}>
              Edit
            </Button>
            <Button onClick={() => handleDelete(task.id)} className={styles.deleteButton}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}