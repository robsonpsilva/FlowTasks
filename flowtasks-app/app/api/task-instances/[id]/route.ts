import db from "@/app/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const result = await db.query(
      `
      UPDATE task_instances
      SET 
        status = $1,
        completed_date = $2
      WHERE id = $3
      RETURNING *
      `,
      [
        body.status,
        body.completed_date ?? new Date().toISOString(),
        id,
      ]
    );

    return Response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return new Response("Failed to update instance", { status: 500 });
  }
}