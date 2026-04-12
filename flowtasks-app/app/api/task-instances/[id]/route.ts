import db from "@/app/lib/db";
import { auth } from "@/auth";
import { NextRequest } from "next/server"; // Importante para a tipagem

// 1. Defina a interface para o contexto do Next.js 15/16
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  req: NextRequest, // Use NextRequest para consistência
  context: RouteContext // Receba o contexto completo
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  
  // 2. Aguarde a Promise dos params antes de desestruturar
  const { id } = await context.params;
  
  const body = await req.json();

  try {
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
  } catch (error) {
    console.error("Erro no update:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}