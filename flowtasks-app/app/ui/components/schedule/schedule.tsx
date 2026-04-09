'use client';

import { useEffect, useMemo, useState } from 'react';
import DayColumn from './daycolumn';
import WeeklyTaskList from '../weeklyTaskList';
import styles from '../componentStyles/schedule.module.css';
import { groupTaskInstancesByDate } from '@/app/services/taskGrouping';

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();

  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

export default function Schedule() {
  const [instances, setInstances] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const week = getWeekDates();

      const start = week[0].toISOString();
      const end = week[6].toISOString();

      const res = await fetch(
        `/api/task-instances?start=${start}&end=${end}`
      );

      const data = await res.json();
      console.log("INSTANCES:", data);

      setInstances(data);
    }

    load();
  }, []);

  // ✔ Group for calendar
  const grouped = useMemo(() => {
    return groupTaskInstancesByDate(instances);
  }, [instances]);

  const week = getWeekDates();

  // ✔ HANDLE STATUS UPDATE (KEY LOGIC)
  async function handleUpdateInstance(
    id: number,
    status: "DONE" | "PENDING"
  ) {
    try {
      // optimistic update (instant UI change)
      setInstances(prev =>
        prev.map(inst =>
          inst.id === id ? { ...inst, status } : inst
        )
      );

      // persist to DB
      await fetch(`/api/task-instances/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          completed_date:
            status === "DONE" ? new Date().toISOString() : null,
        }),
      });

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {/* WEEK HEADER */}
      <div className={styles.currentWeekDisplay}>
        <h2>
          Week{' '}
          {week[0].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -
          {week[6].toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </h2>
      </div>

      {/* CALENDAR */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {week.map((date) => {
          const formatted = date.toISOString().split('T')[0];
          const tasksForDay = grouped[formatted] || [];

          return (
            <DayColumn
              key={formatted}
              date={date}
              tasks={tasksForDay}
              onUpdate={handleUpdateInstance}
            />
          );
        })}
      </div>

      {/* WEEKLY LISTS */}
      <WeeklyTaskList
        instances={instances}
        onUpdate={handleUpdateInstance}
      />
    </>
  );
}