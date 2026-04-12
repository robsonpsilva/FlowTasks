export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export const dayMap: Record<Day, number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

export type TaskPayload = {
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  is_active: boolean; // always true internally
  category_id: number;
};

export type SchedulePayload = {
  frequency:'ONCE' | 'DAILY' | 'WEEKLY';
  days_of_week: Day[];
  start_date: string;
  end_date?: string;
};

export type ScheduleApiPayload = {
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY';
  days_of_week: number[];
  start_date: string;
  end_date?: string;
};

export type TaskWithSchedule = {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  is_active: boolean;
  category_id: number;
  schedule: ScheduleApiPayload;
};

export function formatDate(date: string | Date): string {
  if (!date) return '';

  // If it's a string (ISO or YYYY-MM-DD)
  if (typeof date === 'string') {
    return date.split('T')[0]; // 🔥 THIS FIX
  }

  // If it's a Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const days: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const today = new Date();

export function buildTaskPayload(
  formData: TaskPayload,
  schedule: SchedulePayload,
  dayMap: Record<Day, number>
) {
  const mappedDays = schedule.days_of_week.map((day) => dayMap[day]);

  return {
    ...formData,
    is_active: true,
    schedule: {
      ...schedule,
      days_of_week:
        schedule.frequency === 'WEEKLY' ? mappedDays : [],
    },
  };
}

export const reverseDayMap: Record<number, Day> = Object.fromEntries(
  Object.entries(dayMap).map(([key, value]) => [value, key as Day])
);