import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const sendConfirmationEmail = async ({ email, name }) => {
  if (!env.email.user || !env.email.appPassword || env.email.user === "your_gmail@gmail.com") {
    console.warn("Email is not configured. Skipping confirmation email.");
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.email.user,
      pass: env.email.appPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `"KeelWorks Foundation" <${env.email.user}>`,
    to: email,
    subject: "Your KeelWorks Volunteer Application Has Been Received",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:24px;">
          <main style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
            <header style="background:#1a3c5e; padding:24px; text-align:center;">
              <h1 style="color:#ffffff; margin:0;">KeelWorks Foundation</h1>
            </header>
            <section style="padding:24px; color:#333333;">
              <h2 style="color:#1a3c5e;">Thank you, ${name || "Applicant"}!</h2>
              <p>We have received your volunteer application. Our team will review it and follow up soon.</p>
              <p>Warm regards,<br/><strong>The KeelWorks Team</strong></p>
            </section>
          </main>
        </body>
      </html>
    `,
  });

  return { sent: true, messageId: info.messageId };
};
