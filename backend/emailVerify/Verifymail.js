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

    if (!token || !email) {
      throw new Error("Token or email is missing");
    }

    const verifyUrl = `${backendUrl.replace(/\/+$/, "")}/user/verify/${encodeURIComponent(token)}`;

    const htmlToSend = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:24px;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:20px auto;padding:32px;background-color:#ffffff;border-radius:8px;text-align:center;">
    <h2>Verify Your Email Address</h2>

    <p>Thank you for registering on Miss Noor. Please verify your email address to activate your account.</p>

    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
      <tr>
        <td bgcolor="#00a63d" style="border-radius:6px;">
          <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:15px 28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">
            Verify Your Email
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#777777;">If the button does not work, click this link:</p>

    <p style="font-size:12px;word-break:break-all;">
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>

    <p style="font-size:12px;color:#999999;">Miss Noor &copy; 2026</p>
  </div>
</body>
</html>
`;

    console.log("Email HTML length:", htmlToSend.length);
    console.log("Verification button included:", htmlToSend.includes("Verify Your Email"));

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