import db from "../../lib/db";

// GET ALL
export async function GET() {
  const result = await db.query(`
    SELECT * FROM tasks
    WHERE is_active = true
    ORDER BY created_at DESC
  `);

  return Response.json(result.rows);
}

// CREATE
// CREATE TASK + REQUIRED SCHEDULE
export async function POST(req: Request) {
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
    console.error(error);

    return Response.json(
      { error: "Failed to create task + schedule" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}