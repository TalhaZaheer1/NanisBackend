import { EmailTemplates } from "../utils/emailTemplates";
import nodemailer from "nodemailer";

const sendOTPEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const emailContent = EmailTemplates.otp(otp);

  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

 const sendResetLinkEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"Nanis" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });
};

export {
  sendOTPEmail,
  sendResetLinkEmail
}
