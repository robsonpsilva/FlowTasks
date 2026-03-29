import db from "../../../lib/db";

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

  const result = await db.query(
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

  return Response.json(result.rows[0]);
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
    await client.query('BEGIN');

    const { id } = await params;

    // 1️⃣ Delete schedule
    await client.query(
      `DELETE FROM task_schedules WHERE task_id = $1`,
      [id]
    );

    // 2️⃣ Delete task
    const result = await client.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    return Response.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);

    return Response.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}