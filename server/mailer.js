const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass === "your-16-char-app-password-here") {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}

async function sendOtpEmail(to, subject, otp, purposeLabel) {
  const transport = getTransporter();
  const ownerEmail = process.env.OWNER_EMAIL || to;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0b1120; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #38bdf8; margin: 0 0 12px;">Shoubhik Portfolio Security</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">${purposeLabel}</p>
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #22c55e;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
    </div>
  `;

  const text = `Your Shoubhik Portfolio security OTP is: ${otp}\n\n${purposeLabel}\n\nExpires in 10 minutes.`;

  if (!transport) {
    console.warn("[mailer] Gmail not configured — OTP logged to console for development:");
    console.warn(`  To: ${ownerEmail} | OTP: ${otp} | ${purposeLabel}`);
    return { sent: false, devMode: true, message: "OTP generated — check server terminal (Gmail not configured yet)." };
  }

  await transport.sendMail({
    from: `"Portfolio Security" <${process.env.GMAIL_USER}>`,
    to: ownerEmail,
    subject,
    text,
    html,
  });

  return { sent: true, devMode: false, message: `OTP sent to ${ownerEmail}` };
}

module.exports = { sendOtpEmail, getTransporter };
