import db from "../../lib/db";
import { auth } from "../auth/[...nextauth]/route"; 
// GET ONLY ACTIVE TASKS
// GET /api/tasks?active=true
export async function GET(req: Request) {
const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');

  if (active === 'true') {
    const result = await db.query(`
      SELECT * FROM tasks
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    return Response.json(result.rows);
  }

  // default: all tasks with schedule
  const result = await db.query(
  `SELECT 
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
  INNER JOIN tasks_users tu 
    ON tu.tasks_id = t.id
  LEFT JOIN task_schedules s 
    ON s.task_id = t.id
  WHERE tu.users_id = $1
  ORDER BY t.created_at DESC
  `,
  [userId]
);

  const tasks = result.rows.map((row: any) => ({
    ...row,
    schedule: row.frequency
      ? {
          frequency: row.frequency,
          days_of_week: row.days_of_week ?? [],
          start_date: row.start_date,
          end_date: row.end_date,
        }
      : null,
  }));

  return Response.json(tasks);
}

// CREATE
// CREATE TASK + REQUIRED SCHEDULE
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await db.connect();

  try {
    const body = await req.json();

    if (!body.schedule) {
      return Response.json(
        { error: "Schedule is required" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 1️⃣ Create task
    const taskResult = await client.query(
      `INSERT INTO tasks (
        title, description, status, priority, is_active, category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        body.title,
        body.description,
        body.status || "PENDING",
        body.priority || "MEDIUM",
        true, // always true
        body.category_id,
      ]
    );

    const task = taskResult.rows[0];

  //2️⃣ Link task to user 
      await client.query(
    `INSERT INTO tasks_users (tasks_id, users_id)
    VALUES ($1, $2)`,
    [task.id, userId]);

    const schedule = body.schedule;

    //3️⃣ Create schedule
    const scheduleResult = await client.query(
      `INSERT INTO task_schedules (
        task_id,
        frequency,
        times_per_week,
        days_of_week,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        task.id,
        schedule.frequency,
        schedule.times_per_week || null,
        schedule.days_of_week || null,
        schedule.start_date,
        schedule.end_date || null,
      ]
    );

    await client.query("COMMIT");

    return Response.json(
      {
        ...task,
        schedule: scheduleResult.rows[0],
      },
      { status: 201 }
    );

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return Response.json(
      { error: "Failed to create task + schedule" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}