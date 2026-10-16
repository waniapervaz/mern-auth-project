
import { Resend } from "resend";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyMail = async (token, email) => {
  try {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "template.hbs"),
      "utf-8"
    );

    const template = handlebars.compile(emailTemplateSource);

    const htmlToSend = template({
      token: encodeURIComponent(token),
    });

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Email Verification",
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
