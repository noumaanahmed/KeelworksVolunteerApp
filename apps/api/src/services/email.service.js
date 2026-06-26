import nodemailer from "nodemailer";

export const sendConfirmationEmail = async ({ email, name }) => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_APP_PASSWORD ||
    process.env.EMAIL_USER === "your_gmail@gmail.com"
  ) {
    console.warn("Email not configured — skipping confirmation email.");
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"KeelWorks Foundation" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Your KeelWorks Volunteer Application Has Been Received",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #1a3c5e; padding: 30px 40px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px 40px; color: #333; }
        .body h2 { color: #1a3c5e; }
        .highlight { background: #e8f0fe; border-left: 4px solid #1a3c5e; padding: 12px 16px; border-radius: 4px; margin: 20px 0; }
        .steps { list-style: none; padding: 0; }
        .steps li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .steps li:last-child { border-bottom: none; }
        .steps li::before { content: "✓ "; color: #1a3c5e; font-weight: bold; }
        .footer { background: #f0f0f0; padding: 20px 40px; text-align: center; font-size: 12px; color: #888; }
      </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header"><h1>KeelWorks Foundation</h1></div>
          <div class="body">
            <h2>Thank you, ${name || "Applicant"}! 🎉</h2>
            <p>We have successfully received your volunteer application. Our team will review it and get back to you soon.</p>
            <div class="highlight"><strong>What happens next?</strong></div>
            <ul class="steps">
              <li>Your application is now under review</li>
              <li>Our team will evaluate your skills and availability</li>
              <li>You will receive an update within 5–7 business days</li>
              <li>If approved, we will reach out to schedule an onboarding call</li>
            </ul>
            <p>We appreciate your interest in making a difference with KeelWorks!</p>
            <p>Warm regards,<br/><strong>The KeelWorks Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KeelWorks Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Confirmation email sent:", info.messageId);
  return { sent: true, messageId: info.messageId };
};