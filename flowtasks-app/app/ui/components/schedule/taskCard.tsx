import { TaskInstance } from '@/app/services/taskInstances';

export default function TaskCard({ task }: { task: TaskInstance }) {
  return (
    <div
      style={{
        background: '#222',
        padding: '0.5rem',
        marginTop: '0.5rem',
        borderRadius: '6px',
      }}
    >
      {task.title}
    </div>
  );
}