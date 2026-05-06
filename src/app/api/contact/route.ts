import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!host || !port || !user || !pass || !fromEmail || !toEmail) {
    return null;
  }

  return {
    host,
    port: Number(port),
    user,
    pass,
    fromEmail,
    toEmail,
    secure: process.env.SMTP_SECURE === "true" || Number(port) === 465,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = getFormValue(formData, "name");
    const note = getFormValue(formData, "note");
    const imageValue = formData.get("image");

    if (!name || !note) {
      return NextResponse.json(
        { error: "Add your name and note before sending." },
        { status: 400 },
      );
    }

    if (!(imageValue instanceof File) || imageValue.size === 0) {
      return NextResponse.json(
        { error: "Please upload a photo." },
        { status: 400 },
      );
    }

    if (imageValue.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Use an image under 8MB." },
        { status: 400 },
      );
    }

    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
      return NextResponse.json(
        {
          error:
            "SMTP is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_FROM_EMAIL, and CONTACT_TO_EMAIL.",
        },
        { status: 503 },
      );
    }

    const buffer = Buffer.from(await imageValue.arrayBuffer());
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: `Portfolio Contact <${smtpConfig.fromEmail}>`,
      to: smtpConfig.toEmail,
      replyTo: smtpConfig.fromEmail,
      subject: `New polaroid note from ${name}`,
      text: `${name}\n\n${note}`,
      html: `
        <div style="background:#09090b;padding:24px;font-family:Arial,sans-serif;color:#f4f4f5;">
          <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:28px;padding:18px;background:#111114;">
            <div style="padding:16px;border-radius:24px;background:#000;">
              <div style="border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;background:#000;">
                <img src="cid:contact-photo" alt="Uploaded photo" style="display:block;width:100%;height:auto;" />
              </div>
              <div style="padding:16px 4px 4px;">
                <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;margin-bottom:8px;">Polaroid contact</div>
                <div style="font-size:18px;font-weight:700;margin-bottom:10px;">${name}</div>
                <div style="font-size:15px;line-height:1.7;color:#e4e4e7;">${note}</div>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: imageValue.name,
          content: buffer,
          contentType: imageValue.type || "application/octet-stream",
          cid: "contact-photo",
        },
      ],
    });

    return NextResponse.json({ message: "Your polaroid note was sent." });
  } catch {
    return NextResponse.json(
      { error: "Unable to send your message right now." },
      { status: 500 },
    );
  }
}