import db from "../../../lib/db";


// GET BY ID
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db.query(
    `SELECT * FROM categories WHERE id = $1`,
    [id]
  );

  return Response.json(result.rows[0]);
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


    // 1. delete task
    const result = await client.query(
      `DELETE FROM categories WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}