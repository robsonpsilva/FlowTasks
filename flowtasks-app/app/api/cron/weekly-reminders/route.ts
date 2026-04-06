import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import db from "@/app/lib/db";

// 1. Configuração robusta para produção (Render/Gmail)
const options: SMTPTransport.Options = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para porta 465 (SSL)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  /**
   * Forçamos IPv4 para evitar o erro ENETUNREACH comum no ambiente do Render 
   * ao tentar conexões IPv6 com os servidores do Google.
   */
  // @ts-expect-error: 'family' exists in SMTPTransport but is not exposed in the base Nodemailer types
  family: 4, 
};

const transporter = nodemailer.createTransport(options);

export async function GET(req: Request) {
  // 1. Proteção de Segurança (Cron Secret)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Teste de conexão SMTP inicial (Ajuda no Debug do Render)
    await transporter.verify();

    // 2. Database Query
    // Seleciona usuários com tarefas ativas e pendentes
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

    // 3. Loop de Envio
    for (const user of reminders) {
      await transporter.sendMail({
        from: `"FlowTasks" <${process.env.GMAIL_USER}>`,
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
      });
    }

    return NextResponse.json({ 
      success: true, 
      emails_sent: reminders.length 
    });

  } catch (error) {
    // Log detalhado para o dashboard do Render
    console.error("[NODEMAILER CRON ERROR]:", error);
    
    // Se for erro de autenticação, avisar explicitamente
    if (error instanceof Error && error.message.includes("535")) {
      return NextResponse.json({ error: "Auth Failure: Check App Password" }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}