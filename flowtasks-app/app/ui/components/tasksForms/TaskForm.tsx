'use client';
import styles from '../componentStyles/addForm.module.css';
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
  dayMap, 
  buildTaskPayload, 
  TaskPayload, 
  SchedulePayload, 
  formatDate, 
  days, 
  today, 
  reverseDayMap, 
TaskWithSchedule} from '@/app/lib/formsHelper';
import {
  handleTaskChange,
  handleScheduleChange,
  toggleDayHandler,
} from '@/app/lib/formHandlers';


type Props = {
  mode: 'create' | 'edit';
  initialData?: TaskWithSchedule | null;
  onSuccess?: (task: any) => void;
  open: boolean;
};

export default function AddTaskForm({ open, initialData, onSuccess, mode}: Props) {
// Form state
  const [formData, setFormData] = useState<TaskPayload>({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    is_active: true, 
    category_id: 1,
  });
// Schedule state
  const [schedule, setSchedule] = useState<SchedulePayload>({
    frequency: 'DAILY',
    days_of_week: [],
    start_date: '',
    end_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minStartDate, setMinStartDate] = useState('');
  const [maxEndDate, setMaxEndDate] = useState('');

  useEffect(() => {
  if (open) {
    if (mode === 'edit' && initialData?.schedule) {
      const mappedDays = (initialData.schedule.days_of_week ?? []).map(
            (dayNumber: number) => reverseDayMap[dayNumber]
          );
      setFormData({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        priority: initialData.priority,
        is_active: initialData.is_active,
        category_id: initialData.category_id,
      });

      setSchedule({
        frequency: initialData.schedule.frequency,
        days_of_week: mappedDays,
        start_date: initialData.schedule.start_date
                  ? formatDate(initialData.schedule.start_date)
                  : '',
        end_date: initialData.schedule.end_date
                ? formatDate(initialData.schedule.end_date)
                : '',
      });
    }
  } else {
    // Reset everything when modal closes
    setFormData({
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      is_active: true,
      category_id: 1,
    });

    setSchedule({
      frequency: 'DAILY',
      days_of_week: [],
      start_date: '',
      end_date: '',
    });

    setError(null);
  }
}, [open, mode, initialData]);


//Conditions for date inputs
const maxEndDateObj = new Date();
maxEndDateObj.setMonth(maxEndDateObj.getMonth() + 3);
const minEndDate = schedule.start_date || minStartDate;

  useEffect(() => {
  const today = new Date();

  const min = formatDate(today);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const max = formatDate(maxDate);

  setMinStartDate(min);
  setMaxEndDate(max);
  }, []);

  // ---------------- HANDLER ----------------

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        //Verify that if frequency is weekly, at least one day is selected
      if (schedule.frequency === 'WEEKLY' &&
        (!schedule.days_of_week || schedule.days_of_week.length === 0)) {

            setError('Please select at least one day for weekly schedule');
            setLoading(false);
            return;
        }
      // Map days to numbers for API
       const payload = buildTaskPayload(formData, schedule, dayMap);

      //console.log('SCHEDULE:', schedule);

      const method = mode === 'edit' ? 'PUT' : 'POST';
      const url = mode === 'edit'
          ? `/api/tasks/${initialData?.id}`
          : '/api/tasks';

      const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();

      // Reset
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        is_active: true,
        category_id: 1,
      });

      setSchedule({
        frequency: 'DAILY',
        days_of_week: [],
        start_date: '',
        end_date: '',
      });

      onSuccess?.(newTask);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* TASK FIELDS */}
      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={formData.title}
        onChange={(e) => handleTaskChange(e, setFormData)}
        required
        className={styles.Input }
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => handleTaskChange(e, setFormData)}
        className={styles.Input }
      />

      <select
        name="priority"
        value={formData.priority}
        onChange={(e) => handleTaskChange(e, setFormData)}
        className={styles.Input }
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        name="category_id"
        value={formData.category_id}
        onChange={(e) => handleTaskChange(e, setFormData)}
        className={styles.Input }
      >
        <option value={1}>Work</option>
        <option value={2}>Personal</option>
        <option value={3}>Study</option>
      </select>
     
        <h3 className={styles.sectionTitle}>Add Schedule</h3>
     

      {/* SCHEDULE FIELDS */}
     
        <div className={styles.scheduleContainer}>
          <select
            name="frequency"
            value={schedule.frequency}
            onChange={(e) => handleScheduleChange(e, setSchedule)}
            className={styles.Input }
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>

         {schedule.frequency === 'WEEKLY' && (
          <div className={styles.daysContainer}>
            {days.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDayHandler(day, setSchedule)}
                className={`${styles.dayButton} ${
                 schedule.days_of_week.includes(day) ? styles.dayButtonActive : ''}`}
              >
                {day}
              </button>
            ))}
          </div>
        )}


          <input
            type="date"
            name="start_date"
            required
            value={schedule.start_date}
            onChange={(e) => handleScheduleChange(e, setSchedule)}
            min={minStartDate}
            className={styles.Input }
            />

          <input
            type="date"
            name="end_date"
            required={schedule.frequency === 'WEEKLY'}
            value={schedule.end_date}
            onChange={(e) => handleScheduleChange(e, setSchedule)}
            min={minEndDate}   // can't be before start_date
            max={maxEndDate}   // max 3 months ahead
            className={styles.Input }
            disabled={schedule.frequency === 'DAILY'}
            />
        </div>
      

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading
          ? mode === 'edit' ? 'Updating...' : 'Creating...'
          : mode === 'edit' ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
}