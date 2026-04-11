import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";
import { generateTaskInstances } from "../../services/taskInstances";
import { auth } from "@/auth";

/**
 * GET TASKS
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');

    const baseQuery = `
      SELECT 
        t.*, s.frequency, s.days_of_week, s.start_date, s.end_date
      FROM public.tasks t
      INNER JOIN public.tasks_users tu ON tu.tasks_id = t.id
      LEFT JOIN public.task_schedules s ON s.task_id = t.id
      WHERE tu.users_id = $1
    `;

    const filter = active === 'true' ? " AND t.is_active = true" : "";
    const finalQuery = `${baseQuery}${filter} ORDER BY t.created_at DESC`;

    const result = await db.query(finalQuery, [userId]);

    const tasks = result.rows.map((row: any) => ({
      ...row,
      schedule: row.frequency ? {
        frequency: row.frequency,
        days_of_week: row.days_of_week ?? [],
        start_date: row.start_date,
        end_date: row.end_date,
      } : null,
    }));

    return Response.json(tasks);
  } catch (error) {
    console.error("GET Tasks Error:", error);
    return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

/**
 * CREATE TASK + SCHEDULE + INSTANCES
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await db.connect();

  try {
    const body = await req.json();
    if (!body.schedule) {
      return NextResponse.json(
        { error: "Schedule is required" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /**
     * 1. Create task
     */
    const taskResult = await client.query(
      `
      INSERT INTO public.tasks (
        title,
        description,
        status,
        priority,
        is_active,
        category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        body.title,
        body.description,
        body.status || "PENDING",
        body.priority || "MEDIUM",
        true,
        body.category_id,
      ]
    );

    const task = taskResult.rows[0];

    /**
     * 2. Link task to user (CRITICAL)
     */
    await client.query(
      `
      INSERT INTO public.tasks_users (tasks_id, users_id)
      VALUES ($1, $2)
      `,
      [task.id, userId]
    );

    const schedule = body.schedule;
    console.log("RECEIVED SCHEDULE:", schedule);
    /**
     * 3. Create schedule
     */
    const scheduleResult = await client.query(
      `
      INSERT INTO public.task_schedules (
        task_id,
        frequency,
        times_per_week,
        days_of_week,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        task.id,
        schedule.frequency,
        schedule.times_per_week || null,
        schedule.days_of_week || null,
        schedule.start_date,
        schedule.end_date || null,
      ]
    );

    /**
     * 4. Generate task instances
     */
    const rangeStart = new Date(schedule.start_date);

    const rangeEnd = new Date(schedule.start_date);
    rangeEnd.setDate(rangeEnd.getDate() + 60); // 60-day window

    const instances = generateTaskInstances(
      {
        ...task,
        schedule: scheduleResult.rows[0],
      },
      rangeStart,
      rangeEnd
    );

    console.log("GENERATED INSTANCES:", instances?.length);

    /**
     * 5. Insert instances
     */
    for (const inst of instances) {
      await client.query(
        `
        INSERT INTO public.task_instances (
          task_id,
          scheduled_date,
          status,
          created_at
        )
        VALUES ($1, $2, 'PENDING', NOW())
        ON CONFLICT (task_id, scheduled_date) DO NOTHING
        `,
        [inst.task_id, inst.scheduled_date]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        ...task,
        schedule: scheduleResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST TASK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create task + schedule + instances" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}