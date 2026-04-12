import { Day, TaskPayload, SchedulePayload, formatDate} from './formsHelper';

// AddTaskForm TASK HANDLER
export function handleTaskChange(
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
  setFormData: React.Dispatch<React.SetStateAction<TaskPayload>>
) {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: name === 'category_id' ? Number(value) : value,
  }));
}

export function handleScheduleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  setSchedule: React.Dispatch<React.SetStateAction<SchedulePayload>>
) {
  const { name, value } = e.target;

  setSchedule((prev) => ({
    ...prev,
    [name]: value,
    ...(name === 'frequency' && value === 'DAILY'
      ? {
          days_of_week: [],
          end_date: '', // 🔥 ensure rule is enforced
        }
      : {}),
  }));
}

// AddTaskForm TOGGLE DAY
export function toggleDayHandler(
  day: Day,
  setSchedule: React.Dispatch<React.SetStateAction<SchedulePayload>>
) {
  setSchedule((prev) => {
    const exists = prev.days_of_week.includes(day);

    return {
      ...prev,
      days_of_week: exists
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    };
  });
}