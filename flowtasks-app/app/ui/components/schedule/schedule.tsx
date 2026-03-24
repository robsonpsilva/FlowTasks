'use client';

import DayColumn from './daycolumn';
import styles from '../componentStyles/schedule.module.css';

const mockTasks = [
  { id: '1', title: 'Finish report', date: '2026-03-23' },
  { id: '2', title: 'Gym', date: '2026-03-24' },
  { id: '3', title: 'Study', date: '2026-03-24' },
];

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Schedule() {
  const week = getWeekDates();

  return (
  <>
  <div className={styles.currentWeekDisplay}>
        <h2>Week {week[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>   
    </div>
     <div style={{ display: 'flex', gap: '1rem' }}>
      {week.map((date) => {
        const formatted = date.toISOString().split('T')[0];

        const tasksForDay = mockTasks.filter(
          (task) => task.date === formatted
        );

        return (
          <DayColumn
            key={formatted}
            date={date}
            tasks={tasksForDay}
          />
        );
      })}
    </div>
  
  </>
   
  );
}