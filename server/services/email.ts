import nodemailer from "nodemailer";

// SMTP Configuration from env or fallback test transport
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('🚀 Using real SMTP transport');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // If real SMTP credentials are not provided, throw an error to avoid silent Ethereal fallback
  console.error('❌ SMTP credentials not set in .env. Email will not be sent.');
  throw new Error('SMTP configuration missing');
};

export async function sendWelcomeAndResetEmail({
  email,
  name,
  resetToken,
}: {
  email: string;
  name: string;
  resetToken: string;
}) {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/?action=reset-password&token=${resetToken}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: 800;">Electro<span style="color: #0f172a;">Hub</span></h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Premium Electronics Marketplace</p>
      </div>

      <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700;">Welcome to ElectroHub, ${name}! 🎉</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Your user account has been successfully registered on ElectroHub. We are excited to have you on board!
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          If you ever need to change or reset your password, you can do so securely at any time using the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            🔐 Change My Password
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
          Or copy and paste this link in your browser:<br/>
          <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px;">
        <p>© 2025 ElectroHub Technologies. All rights reserved.</p>
        <p>If you did not create this account, please ignore this email.</p>
      </div>
    </div>
  `;

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: '"ElectroHub Team" <no-reply@electrohub.com>',
      to: email,
      subject: "🎉 Welcome to ElectroHub - Account Registration Successful!",
      html: htmlContent,
    });

    console.log("=======================================================");
    console.log(`✉️ WELCOME EMAIL SENT TO: ${email}`);
    console.log(`🔑 PASSWORD RESET LINK: ${resetLink}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🌐 EMAIL PREVIEW URL: ${previewUrl}`);
    }
    console.log("=======================================================");

    return { success: true, resetLink };
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    console.log(`🔑 FALLBACK PASSWORD RESET LINK FOR ${email}: ${resetLink}`);
    return { success: false, resetLink };
  }
}
