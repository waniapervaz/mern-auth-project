import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyMail = async (token, email) => {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_URL is missing from .env");
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing from .env");
    }

    if (!token) {
      throw new Error("Verification token is missing");
    }

    if (!email) {
      throw new Error("Recipient email is missing");
    }

    const verifyUrl =
      `${backendUrl.replace(/\/+$/, "")}/user/verify/${encodeURIComponent(token)}`;

    const htmlToSend = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:20px auto;padding:30px;background:#ffffff;border-radius:8px;text-align:center;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering on Miss Noor. Please verify your email address to activate your account.</p>
          <p style="margin:30px 0;">
            <a href="${verifyUrl}" target="_blank"
              style="display:inline-block;padding:14px 26px;background:#00a63d;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
              Verify Your Email
            </a>
          </p>
          <p style="color:#777;font-size:13px;">
            If you did not create this account, you can ignore this email.
          </p>
          <p style="color:#999;font-size:12px;">Miss Noor &copy; 2026</p>
        </div>
      </body>
      </html>
    `;

    console.log(
      "Verification button included:",
      htmlToSend.includes("Verify Your Email")
    );

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email Address",
      html: htmlToSend,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("Verification email sent:", data?.id);

    return data;
  } catch (error) {
    console.error("Verification email error:", error.message);
    throw error;
  }
};