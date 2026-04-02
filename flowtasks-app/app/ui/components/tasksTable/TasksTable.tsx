import { useState } from "react";
import TableRow from "./TableRow";
import Pagination from "./Pagination";
import { TaskTableRow } from "../../../lib/definitions";
import styles from '../componentStyles/taskTable.module.css';

interface TasksTableProps {
  tasks: TaskTableRow[];
  handleEdit: (task: TaskTableRow) => void;
  handleDelete: (id: number) => void;
}

const ITEMS_PER_PAGE = 10;

export default function TasksTable({
  tasks,
  handleEdit,
  handleDelete,
}: TasksTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
        <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr>
            <th className={styles.column}>Title</th>
            <th className={styles.column}>Status</th>
            <th className={styles.column}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentTasks.map((task) => (
            <TableRow
              key={task.id}
              task={task}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}