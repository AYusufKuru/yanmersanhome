import "server-only";

import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  text: string;
};

function smtpSettings() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD ?? "";
  const from = (process.env.MAIL_FROM || user)?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  if (!host || !user || !pass || !from || !Number.isInteger(port)) {
    return null;
  }
  return {
    host,
    user,
    pass,
    from,
    port,
    secure: port === 465,
  };
}

export function mailConfigured() {
  return smtpSettings() !== null;
}

export async function sendMail(input: MailInput) {
  const settings = smtpSettings();
  if (!settings) {
    return { sent: false as const };
  }

  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.pass },
  });

  await transport.sendMail({
    from: settings.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
  return { sent: true as const };
}
