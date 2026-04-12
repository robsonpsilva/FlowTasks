import { useState, useEffect} from "react";
import styles from '../componentStyles/taskList.module.css';
import Button from "../button";
import Pagination from "../tasksTable/Pagination";
import {formatDate} from '@/app/lib/formsHelper';
import TaskFilters from "./TaskFilters";
import { getCategories } from "@/app/lib/dbCallHandelers";
const ITEMS_PER_PAGE = 5; 

export default function TasksList({ tasks, handleEdit, handleDelete }: any) {
    const [categories, setCategories] = useState<any[]>([]);
     const [currentPage, setCurrentPage] = useState<number>(1);
     const [filters, setFilters] = useState({
      priority: '',
      sortBy: '', // 'start_date' | 'end_date'
      order: 'asc', // 'asc' | 'desc'
    });

      const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'reset') {
          setFilters({
            priority: '',
            sortBy: '',
            order: 'asc',
          });
          return;
        }

        setFilters((prev) => ({
          ...prev,
          [name]: value,
        }));

        setCurrentPage(1);
      };

      const filteredTasks = tasks.filter((task: any) => {
          const matchesPriority =
            !filters.priority || task.priority === filters.priority;
            return matchesPriority;
        });

      const sortedTasks = filters.sortBy
        ? [...filteredTasks].sort((a: any, b: any) => {
            const aDate = a[filters.sortBy];
            const bDate = b[filters.sortBy];

            if (!aDate || !bDate) return 0;

            return filters.order === 'asc'
              ? new Date(aDate).getTime() - new Date(bDate).getTime()
              : new Date(bDate).getTime() - new Date(aDate).getTime();
          })
        : filteredTasks;
    
     const totalPages = Math.max(1, Math.ceil(sortedTasks.length / ITEMS_PER_PAGE));
    
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const currentTasks = sortedTasks.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      );
      useEffect(() => {
        async function loadCategories() {
          const data = await getCategories();
          setCategories(data);
        }

        loadCategories();
      }, []);

      const getCategoryName = (id: number) => {
        const category = categories.find((c) => c.id === id);
        return category ? category.name : 'Unknown';
      };
      
    
  return (
    <div className={styles.listContainer}>
      <TaskFilters filters={filters} onChange={handleFilterChange} />
         <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
      {currentTasks.map((task: any) => (
        <div key={task.id} className={styles.card}>
          {/* HEADER */}
            <div className={styles.cardHeader}>
              <p className={`${styles.cardPriority} ${
                task.priority === 'HIGH'
                  ? styles.priorityHigh
                  : task.priority === 'MEDIUM'
                  ? styles.priorityMedium
                  : styles.priorityLow
              }`}>
                {task.priority}
              </p>

              <h3 className={styles.cardTitle}>{task.title}</h3>
            </div>
         
          {/* DESCRIPTION */}
            <p className={styles.cardDescription}>{task.description}</p>
         

          {/* META */}
            <div className={styles.cardMeta}>
              <p className={styles.cardCategory}>
                {
                  categories.find(c => c.id === task.category_id)?.name || 'Unknown'
                }
              </p>

              <p className={styles.cardFrequency}>
                {task.schedule.frequency}
              </p>
            </div>
    

          <div className={styles.cardBottom}>
             {/* DATES */}
            <div className={styles.cardDates}>
              <p>Start: {formatDate(task.start_date)}</p>
              <p>End: {task.end_date ? formatDate(task.end_date) : 'N/A'}</p>
            </div>

            {/* FOOTER */}
            <div className={styles.cardFooter}>
              <Button onClick={() => handleEdit(task)} className={styles.editButton}>
                Edit
              </Button>
              <Button onClick={() => handleDelete(task.id)} className={styles.deleteButton}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}