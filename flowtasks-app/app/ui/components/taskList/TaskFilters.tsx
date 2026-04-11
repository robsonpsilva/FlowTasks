import styles from '../componentStyles/taskList.module.css';

type Filters = {
  priority: string;
  sortBy: string;
  order: string;
};

type Props = {
  filters: Filters;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export default function TaskFilters({ filters, onChange }: Props) {
  return (
    <div className={styles.filtersContainer}>
      
      <div className={styles.filterGroup}>
        <label>Priority</label>
        <select
          name="priority"
          value={filters.priority}
          onChange={onChange}
          className={`${ !filters.priority ? styles.dropdownDefault : styles.dropdownActive}`}
        >
          <option value="">All</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Sort By</label>
        <select
            name="sortBy"
            value={filters.sortBy}
            onChange={onChange}
             className={`${ !filters.sortBy ? styles.dropdownDefault : styles.dropdownActive}`}
        >
            <option value="">None</option>
            <option value="start_date">Start Date</option>
            <option value="end_date">End Date</option>
        </select>
        </div>

        <div className={styles.filterGroup}>
        <label>Order</label>
        <select
            name="order"
            value={filters.order}
            onChange={onChange}
            className={styles.dropdown}
             disabled={!filters.sortBy}
        >
            <option value="asc">Ascending ↑</option>
            <option value="desc">Descending ↓</option>
        </select>
        </div>

      <button
        type="button"
        onClick={() =>
          onChange({
            target: { name: 'reset', value: '' }
          } as any)
        }
        className={styles.clearButton}
      >
        Clear
      </button>

    </div>
  );
}