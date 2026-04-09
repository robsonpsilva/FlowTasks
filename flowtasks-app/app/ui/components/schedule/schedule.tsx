'use client';

import { useEffect, useMemo, useState } from 'react';
import DayColumn from './daycolumn';
import styles from '../componentStyles/schedule.module.css';

import { groupTaskInstancesByDate } from '@/app/services/taskGrouping';

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

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Schedule() {
  const [instances, setInstances] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/task-instances');
      const data = await res.json();

      // normalize date shape (critical for grouping)
      const normalized = data.map((i: any) => ({
        ...i,
        scheduled_date: i.scheduled_date,
      }));

      setInstances(normalized);
    }

    load();
  }, []);

  const grouped = useMemo(() => {
    return groupTaskInstancesByDate(instances);
  }, [instances]);

  const week = getWeekDates();

  return (
    <>
      <div className={styles.currentWeekDisplay}>
        <h2>
          Week{' '}
          {week[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {week[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {week.map((date) => {
          const key = formatDateLocal(date);
          const tasksForDay = grouped[key] || [];

          return (
            <DayColumn
              key={key}
              date={date}
              tasks={tasksForDay}
            />
          );
        })}
      </div>
    </>
  );
}