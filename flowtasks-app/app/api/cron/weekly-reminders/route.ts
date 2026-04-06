import { NextResponse } from "next/server";
import { Resend } from "resend"; // Importação do novo pacote
import db from "@/app/lib/db";

// Inicializa o Resend com a sua chave de API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // 1. Proteção de Segurança (Cron Secret)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Database Query
    const { rows: reminders } = await db.query(`
      SELECT 
        u.name, 
        u.email, 
        COUNT(t.id) as task_count
      FROM public.users u
      JOIN public.tasks_users tu ON u.id = tu.users_id
      JOIN public.tasks t ON tu.tasks_id = t.id
      WHERE t.is_active = true 
        AND t.status IN ('PENDING', 'IN_PROGRESS')
      GROUP BY u.name, u.email
    `);

    if (reminders.length === 0) {
      return NextResponse.json({ message: "No reminders to send" });
    }

    // 3. Preparação e Envio via Resend (Batch/Lote)
    // O Resend permite enviar até 100 e-mails em uma única chamada de API
    const emailData = reminders.map((user) => ({
      from: "FlowTasks <notificacoes@rpstech.dev.br", // Use o domínio do Resend para testes
      to: user.email,
      subject: `📌 Weekly Reminder: You have ${user.task_count} pending tasks!`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #FF6B35;">Hello, ${user.name}!</h2>
          <p>This is a friendly reminder from <strong>FlowTasks</strong>. You have <strong>${user.task_count} tasks</strong> waiting for your attention this week.</p>
          <p>Don't let your goals slip away! Check your dashboard to see what's next.</p>
          <br />
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
               style="background: #FF6B35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               Open FlowTasks
            </a>
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            You are receiving this because you are a registered user of FlowTasks.
          </p>
        </div>
      `,
    }));

    // Envio em lote é muito mais rápido e resiliente que o loop de SMTP
    const { data, error } = await resend.batch.send(emailData);

    if (error) {
      console.error("[RESEND ERROR]:", error);
      throw new Error("Failed to send batch emails");
    }

    return NextResponse.json({ 
      success: true, 
      emails_sent: reminders.length,
      resend_id: Array.isArray(data) ? data.map(d => d.id) : []
    });

  } catch (error) {
    // Log para o dashboard do Render
    console.error("[CRON JOB ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}