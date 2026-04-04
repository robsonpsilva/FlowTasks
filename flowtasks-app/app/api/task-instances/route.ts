import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";
import { generateTaskInstances } from "../../services/taskInstances";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const from =
        searchParams.get("from") ||
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const to =
        searchParams.get("to") ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.query(`
    SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.is_active,
        t.category_id,
        t.created_at,
        t.updated_at,

        s.frequency,
        s.days_of_week,
        s.start_date,
        s.end_date
    FROM tasks t
    LEFT JOIN task_schedules s 
        ON s.task_id = t.id
  `);

    // console.log("TASK ROWS:", result.rows);

    const tasks = result.rows.map((t: any) => ({
        ...t,

        schedule: {
            frequency: t.frequency,
            days_of_week: Array.isArray(t.days_of_week)
                ? t.days_of_week
                : t.days_of_week ?? [],
            start_date: t.start_date,
            end_date: t.end_date,
        },
    }));

    // console.log("TASKS AFTER MAP:", tasks);

    const instances = tasks.flatMap((task) =>
        generateTaskInstances(task, from, to)
    );

    return NextResponse.json(instances);
}