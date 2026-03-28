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
export async function POST(req: Request) {
  const body = await req.json();

  const result = await db.query(
    `INSERT INTO tasks (title, description, status, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      body.title,
      body.description,
      body.status || "PENDING",
      body.priority || "MEDIUM",
    ]
  );

  return Response.json(result.rows[0], { status: 201 });
}