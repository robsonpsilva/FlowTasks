import db from "../../lib/db";
/**
 * GET Categories
 */
export async function GET(req: Request) {

  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');

    const baseQuery = `
      SELECT 
        *
      FROM categories
    `;

    const result = await db.query(baseQuery);


    return Response.json(result.rows);
  } catch (error) {
    console.error("GET Categories Error:", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}