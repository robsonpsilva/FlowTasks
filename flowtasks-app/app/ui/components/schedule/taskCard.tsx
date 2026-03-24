import { Task } from "@/app/lib/definitions";

export default function TaskCard({ task }: { task: Task }) {
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