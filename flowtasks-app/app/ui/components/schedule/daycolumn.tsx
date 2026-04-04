import { TaskInstance } from '@/app/services/taskInstances';
import TaskCard from './taskCard';
import { Task } from '@/app/lib/definitions';

export default function DayColumn({ date, tasks }: { date: Date; tasks: TaskInstance[] }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#111',
        padding: '1rem',
        borderRadius: '8px',
        minHeight: '300px',
      }}
    >
      <h3>
        {date.toLocaleDateString('en-US', { weekday: 'short' })}
      </h3>

      <p>{date.getDate()}</p>

      {tasks.map((task) => (
        <TaskCard key={task.task_id} task={task} />
      ))}
    </div>
  );
}