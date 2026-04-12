import db from "@/app/lib/db";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const body = await req.json();

  const result = await db.query(
    `
    UPDATE task_instances ti
    SET status = $1,
        completed_date = $2
    FROM tasks t
    JOIN tasks_users tu ON tu.tasks_id = t.id
    WHERE ti.id = $3
      AND ti.task_id = t.id
      AND tu.users_id = $4
    RETURNING ti.*;
    `,
    [
      body.status,
      body.completed_date ?? new Date().toISOString(),
      id,
      userId,
    ]
  );

  if (result.rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(result.rows[0]);
}