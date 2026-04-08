import db from "../../lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');

    // AJUSTE: O filtro 'active' agora precisa do JOIN com tasks_users
    const baseQuery = `
      SELECT 
        t.*, s.frequency, s.days_of_week, s.start_date, s.end_date
      FROM public.tasks t
      INNER JOIN public.tasks_users tu ON tu.tasks_id = t.id
      LEFT JOIN public.task_schedules s ON s.task_id = t.id
      WHERE tu.users_id = $1
    `;

    const filter = active === 'true' ? " AND t.is_active = true" : "";
    const finalQuery = `${baseQuery}${filter} ORDER BY t.created_at DESC`;

    const result = await db.query(finalQuery, [userId]);

    const tasks = result.rows.map((row: any) => ({
      ...row,
      schedule: row.frequency ? {
        frequency: row.frequency,
        days_of_week: row.days_of_week ?? [],
        start_date: row.start_date,
        end_date: row.end_date,
      } : null,
    }));

    return Response.json(tasks);
  } catch (error) {
    console.error("GET Tasks Error:", error);
    return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await db.connect();

  try {
    const body = await req.json();
    if (!body.schedule) {
      return Response.json({ error: "Schedule is required" }, { status: 400 });
    }

    await client.query("BEGIN");

    // 1️⃣ REMOVIDO 'user_id' daqui, pois não existe na tabela 'tasks' do seu SQL
    const taskResult = await client.query(
      `INSERT INTO public.tasks (
        title, description, status, priority, is_active, category_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        body.title,
        body.description,
        body.status || 'PENDING',
        body.priority || 'MEDIUM',
        true,
        body.category_id
      ]
    );

    const task = taskResult.rows[0];

    // 2️⃣ O vínculo com o usuário acontece aqui (Esta tabela existe no seu SQL)
    await client.query(
      `INSERT INTO public.tasks_users (tasks_id, users_id)
      VALUES ($1, $2)`,
      [task.id, userId]
    );

    const { schedule } = body;

    // 3️⃣ Inserção do Schedule (Bate com seu SQL)
    const scheduleResult = await client.query(
      `INSERT INTO public.task_schedules (
        task_id, frequency, times_per_week, days_of_week, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        task.id,
        schedule.frequency,
        schedule.times_per_week || null,
        schedule.days_of_week || null,
        schedule.start_date,
        schedule.end_date || null,
      ]
    );

    await client.query("COMMIT");

    return Response.json({ ...task, schedule: scheduleResult.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("API POST Error:", error);
    return Response.json({ error: "Failed to create task" }, { status: 500 });
  } finally {
    client.release();
  }
}