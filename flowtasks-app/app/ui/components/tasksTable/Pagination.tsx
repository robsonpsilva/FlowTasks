import Button from "../button";
import styles from '../componentStyles/taskTable.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        onClick={() => setCurrentPage((prev) => prev - 1)}
        disabled={currentPage === 1}
        className={styles.pageButton + " " + (currentPage === 1 ? styles.disabled : "")}
      >
        Prev
      </Button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        onClick={() => setCurrentPage((prev) => prev + 1)}
        disabled={currentPage === totalPages}
        className={styles.pageButton + " " + (currentPage === totalPages ? styles.disabled : "")}
      >
        Next
      </Button>
    </div>
  );
}