import db from "../../lib/db";
import { auth } from "@/auth";

// GET /api/tasks
export async function GET(req: Request) {
  const session = await auth();

  // 🛡️ Proteção de Camada de API
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');

  if (active === 'true') {
    const result = await db.query(`
      SELECT * FROM tasks
      WHERE is_active = true AND user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return Response.json(result.rows);
  }

  // default: all tasks with schedule + filter by user
  const result = await db.query(`
    SELECT 
      t.*,
      s.frequency,
      s.days_of_week,
      s.start_date,
      s.end_date
    FROM tasks t
    LEFT JOIN task_schedules s 
      ON s.task_id = t.id
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC
  `, [userId]);

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

// CREATE TASK + REQUIRED SCHEDULE
export async function POST(req: Request) {
  const session = await auth();

  // 🛡️ Proteção de Camada de API
  if (!session || !session.user?.id) {
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

    // 1️⃣ Create task associada ao userId da sessão
    const taskResult = await client.query(
      `INSERT INTO tasks (
        title, description, status, priority, is_active, category_id, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        body.title,
        body.description,
        body.status || "PENDING",
        body.priority || "MEDIUM",
        true,
        body.category_id,
        userId // 🛡️ ID vindo da sessão segura
      ]
    );

    const task = taskResult.rows[0];
    const schedule = body.schedule;

    // 2️⃣ Create schedule
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
    console.error("API Error:", error);

    return Response.json(
      { error: "Failed to create task + schedule" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}