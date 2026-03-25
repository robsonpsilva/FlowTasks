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

// DELETE
export async function DELETE(
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