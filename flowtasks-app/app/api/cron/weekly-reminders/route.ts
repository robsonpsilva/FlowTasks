import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/app/lib/db";

// Initialize the Gmail Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your @gmail.com address
    pass: process.env.GMAIL_APP_PASSWORD, // Your 16-digit App Password
  },
});

export async function GET(req: Request) {
  // 1. Security Protection
  // Only authorized requests with the correct secret can trigger this
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Database Query
    // Joins users with their active, non-completed tasks
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

    // 3. Email Dispatch Loop via Nodemailer
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
    // Log errors for debugging in the Render dashboard
    console.error("[NODEMAILER CRON ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}