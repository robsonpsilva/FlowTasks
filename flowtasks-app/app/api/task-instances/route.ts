import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { searchParams } = new URL(req.url);

  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    let query = `
      SELECT 
        ti.id,
        ti.task_id,
        ti.scheduled_date,
        ti.status,
        ti.created_at,
        t.title,
        t.priority
      FROM task_instances ti
      JOIN tasks t ON t.id = ti.task_id
      JOIN tasks_users tu ON tu.tasks_id = t.id
      WHERE tu.users_id = $1
    `;

    const params: any[] = [userId];

    if (start && end) {
      query += ` AND ti.scheduled_date BETWEEN $2 AND $3 `;
      params.push(start, end);
    }

    query += ` ORDER BY ti.scheduled_date ASC`;

    const result = await db.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch task instances" },
      { status: 500 }
    );
  }
}