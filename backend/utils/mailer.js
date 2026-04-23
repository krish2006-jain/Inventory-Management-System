import nodemailer from "nodemailer";

// Create transporter — uses environment vars for SMTP config
// Falls back to Ethereal (test) mail if no config provided
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_PORT || "587") === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("[Mailer] Using Ethereal test account:", testAccount.user);
  }

  return transporter;
};

/**
 * Send account credentials email to a new employee
 */
export const sendCredentialsEmail = async ({ to, name, email, password, role, loginUrl }) => {
  try {
    const transport = await getTransporter();
    const roleName = role === "stockmgr" ? "Stock Manager" : role === "cashier" ? "Cashier" : "Owner";
    const storeName = process.env.STORE_NAME || "Stockly";

    const info = await transport.sendMail({
      from: `"${storeName}" <${process.env.SMTP_USER || "noreply@stockly.com"}>`,
      to,
      subject: `Your ${storeName} Account has been created`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">${storeName}</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Inventory Management System</p>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">Welcome, ${name}!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              An account has been created for you with the role of <strong>${roleName}</strong>.
              Use the credentials below to log in.
            </p>
            <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${email}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Password</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${password}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Role</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${roleName}</td></tr>
              </table>
            </div>
            <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 8px;">Log in to ${storeName}</a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
              Please change your password after first login. If you did not expect this email, contact your administrator.
            </p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 16px;">
            &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
          </p>
        </div>
      `,
    });

    // Log Ethereal preview URL in development
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("[Mailer] Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("[Mailer] Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async ({ to, name, password, loginUrl }) => {
  try {
    const transport = await getTransporter();
    const storeName = process.env.STORE_NAME || "Stockly";

    const info = await transport.sendMail({
      from: `"${storeName}" <${process.env.SMTP_USER || "noreply@stockly.com"}>`,
      to,
      subject: `Your ${storeName} password has been reset`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">${storeName}</h1>
          </div>
          <div style="background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">Password Reset</h2>
            <p style="color: #475569; font-size: 14px;">Hi ${name}, your password has been reset by an administrator.</p>
            <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b;">New Password</td><td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${password}</td></tr>
              </table>
            </div>
            <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Log in now</a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">Please change your password immediately after logging in.</p>
          </div>
        </div>
      `,
    });

    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("[Mailer] Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return { success: true };
  } catch (error) {
    console.log("[Mailer] Failed to send reset email:", error.message);
    return { success: false, error: error.message };
  }
};
