"use server";

import { Resend } from "resend";

export async function sendAdminNotificationEmail(userEmail: string, courseTitle: string, requestId: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!apiKey || !adminEmail) {
      console.warn("RESEND_API_KEY or ADMIN_EMAIL is missing in .env.local. Email notification skipped.");
      return { success: false, error: "Resend configuration missing" };
    }

    // Allow multiple emails by splitting on commas
    const toEmails = adminEmail.split(',').map(email => email.trim());

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "HivePod Alerts <onboarding@resend.dev>",
      to: toEmails,
      subject: `New Course Access Request: ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff453a;">New Course Access Request</h2>
          <p>Hello Admin,</p>
          <p>A user has requested access to one of your courses.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; color: #333;">
            <p style="margin: 5px 0;"><strong>User Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <p>Please log in to your HivePod Admin Dashboard to review and approve/reject this request.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/requests" style="background-color: #ff453a; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">View Requests</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending admin email via Resend:", error);
    return { success: false, error: error.message };
  }
}
