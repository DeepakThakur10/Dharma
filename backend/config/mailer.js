import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an invitation email
 * @param {string} to — recipient email
 * @param {string} inviterName — name of the person inviting
 * @param {string} projectName — name of the project
 * @param {string} acceptUrl — link to accept the invitation
 */
export async function sendInviteEmail(to, inviterName, projectName, acceptUrl) {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #ff6b35, #ffa07a); color: white; font-size: 24px; font-weight: bold; line-height: 48px;">M</div>
      </div>
      <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 8px;">You're Invited!</h2>
      <p style="color: #495057; text-align: center; margin-bottom: 24px; line-height: 1.6;">
        <strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> on Dharma.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${acceptUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #ff6b35, #ffa07a); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #868e96; text-align: center; font-size: 13px;">
        If you don't have an account, you'll be prompted to create one first.
      </p>
      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 24px 0;" />
      <p style="color: #adb5bd; text-align: center; font-size: 11px;">
        © ${new Date().getFullYear()} Dharma. This email was sent because someone invited you to collaborate.
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"Dharma" <${process.env.SMTP_USER}>`,
        to,
        subject: `${inviterName} invited you to "${projectName}" — Dharma`,
        html,
    });
}

export default transporter;
