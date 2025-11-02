import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const response = await resend.emails.send({
      from: "CakeHaven <onboarding@resend.dev>", // temporary dev sender
      to,
      subject,
      html,
    });

    console.log("📧 Email sent successfully:", response);
    return response;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    throw new Error(error.message || "Email sending failed");
  }
}

/**
 * 🔐 Password Reset Email
 */
export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #e63946;">Reset Your CakeHaven Password</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #e63946; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      <p>If you didn’t request this, please ignore this email.</p>
      <br/>
      <p>– The CakeHaven Team 🍰</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Reset your CakeHaven password",
    html,
  });
}

/**
 * ✅ Shop Enquiry Approved Email
 */
export async function sendEnquiryApprovedEmail(to: string, shopName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2a9d8f;">🎉 Your Shop Enquiry Has Been Approved!</h2>
      <p>Dear ${shopName},</p>
      <p>Great news! Your shop enquiry has been <strong>approved</strong>. You can now sign in and access your Shop Admin Dashboard to start adding cakes and managing your shop.</p>
      <a href="${process.env.FRONTEND_URL}/auth/signin" style="display: inline-block; background-color: #2a9d8f; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
      <br/><br/>
      <p>Welcome aboard and happy selling 🎂</p>
      <p>– The CakeHaven Team 🍰</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Your Shop Enquiry Has Been Approved",
    html,
  });
}

/**
 * ❌ Shop Enquiry Rejected Email
 */
export async function sendEnquiryRejectedEmail(
  to: string,
  shopName: string,
  reason?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #e76f51;">😞 Your Shop Enquiry Was Rejected</h2>
      <p>Dear ${shopName},</p>
      <p>We’re sorry to inform you that your shop enquiry was <strong>not approved</strong> at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>You can update your details and resubmit your enquiry for review.</p>
      <a href="${
        process.env.FRONTEND_URL
      }/auth/enquiry" style="display: inline-block; background-color: #e76f51; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px;">Resubmit Enquiry</a>
      <br/><br/>
      <p>We appreciate your interest and look forward to reviewing again.</p>
      <p>– The CakeHaven Team 🍰</p>
    </div>
  `;

  return sendEmail({ to, subject: "Your Shop Enquiry Was Rejected", html });
}
