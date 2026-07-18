import nodemailer from 'nodemailer';
import { env } from '../config/env';

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log(`✉️ [Mail Sandbox] Email would have been sent:
To: ${to}
Subject: ${subject}
Content: ${text || html}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️ Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}
