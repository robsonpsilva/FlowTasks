import db from "../../../lib/db";

// helper: convert empty string → null for timestamp fields
const toTimestamp = (value: any) => {
  if (value === "" || value === undefined || value === null) {
    return null;
  }
  return value;
};

// GET BY ID
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.query(
    `SELECT * FROM tasks WHERE id = $1`,
    [id]
  );

  return Response.json(result.rows[0]);
}

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Update task
    const taskResult = await client.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        body.title,
        body.description,
        body.status,
        body.priority,
        id,
      ]
    );

    // 2. Update schedule (1:1 relation)
    const scheduleResult = await client.query(
      `UPDATE task_schedules
       SET frequency = $1,
           days_of_week = $2,
           start_date = $3,
           end_date = $4
       WHERE task_id = $5
       RETURNING *`,
      [
        body.schedule?.frequency ?? null,
        body.schedule?.days_of_week ?? [],
        toTimestamp(body.schedule?.start_date),
        toTimestamp(body.schedule?.end_date),
        id,
      ]
    );

    await client.query("COMMIT");

    return Response.json({
      ...taskResult.rows[0],
      schedule: scheduleResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return new Response("Failed to update task", { status: 500 });
  } finally {
    client.release();
  }
}

// deactivateTask (soft delete)
export async function DEACTIVATE_TASK(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.query(
    `UPDATE tasks SET is_active = false WHERE id = $1`,
    [id]
  );

  return Response.json({ success: true });
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { id } = await params;

    // 1. delete user relations
    await client.query(
      `DELETE FROM tasks_users WHERE tasks_id = $1`,
      [id]
    );

    // 2. delete instances
    await client.query(
      `DELETE FROM task_instances WHERE task_id = $1`,
      [id]
    );

    // 3. delete schedule
    await client.query(
      `DELETE FROM task_schedules WHERE task_id = $1`,
      [id]
    );

    // 4. delete task
    const result = await client.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return Response.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}