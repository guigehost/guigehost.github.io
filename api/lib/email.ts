import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    html,
  });
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "【鬼哥工具箱】您的注册验证码",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">邮箱验证</h2>
        <p>您好，感谢注册鬼哥工具箱！</p>
        <p>您的验证码是：</p>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 28px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">验证码将在 10 分钟内过期。</p>
        <p style="color: #666; font-size: 14px;">如果不是您本人操作，请忽略此邮件。</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "【鬼哥工具箱】密码重置验证码",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">密码重置</h2>
        <p>您好！</p>
        <p>您申请了密码重置，您的验证码是：</p>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 28px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">验证码将在 10 分钟内过期。</p>
        <p style="color: #666; font-size: 14px;">如果不是您本人操作，请忽略此邮件。</p>
      </div>
    `,
  });
}
