import { TaskTableRow } from "../../../lib/definitions";
import Button from "../button";
import styles from '../componentStyles/taskTable.module.css';

interface TableRowProps {
  task: TaskTableRow;
  handleEdit: (task: TaskTableRow) => void;
  handleDelete: (id: number) => void;
}

export default function TableRow({
  task,
  handleEdit,
  handleDelete,
}: TableRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>{task.title}</td>
      <td className={styles.cell}>{task.status}</td>
      <td className={styles.cell + " " + styles.actions}>
        <Button
          onClick={() => handleEdit(task)}
          className={styles.editButton}
        >
          Edit
        </Button>

        <Button
          onClick={() => handleDelete(task.id)}
          className={styles.deleteButton}
        >
          Delete
        </Button>
      </td>
    </tr>
  );
}