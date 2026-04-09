import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(req: NextRequest) {
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
    `;

    const params: any[] = [];

    if (start && end) {
      query += ` WHERE ti.scheduled_date BETWEEN $1 AND $2 `;
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