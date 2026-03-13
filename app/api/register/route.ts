// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function verifyEmail(name: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#0a0a0a;border:1px solid #1e1e1e;">
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,#d4af37,#f0d060,#d4af37);"></td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #1a1a1a;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:28px;height:28px;border:1px solid #d4af37;text-align:center;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-style:italic;color:#d4af37;font-size:13px;">M</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:#444;">MEAL PLANNER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:16px;height:1px;background-color:#d4af37;vertical-align:middle;"></td>
                  <td style="padding-left:10px;">
                    <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;">Verify your email</span>
                  </td>
                </tr>
              </table>
              <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:28px;line-height:1.15;color:#f0ece0;margin:0 0 16px;">
                Welcome, ${name}.
              </h1>
              <p style="font-family:'Courier New',monospace;font-size:11px;line-height:1.8;color:#555;margin:0 0 28px;">
                Enter the code below to verify your account. It expires in 15 minutes.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#111;border:1px solid #d4af37;padding:20px 40px;text-align:center;">
                    <span style="font-family:'Courier New',monospace;font-size:32px;font-weight:500;letter-spacing:12px;color:#d4af37;">${code}</span>
                  </td>
                </tr>
              </table>
              <p style="font-family:'Courier New',monospace;font-size:10px;line-height:1.8;color:#333;margin:0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:1px;background-color:#1a1a1a;"></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;">
              <p style="font-family:'Courier New',monospace;font-size:8px;color:#2a2a2a;margin:0;letter-spacing:2px;text-transform:uppercase;line-height:1.8;">
                This code expires in 15 minutes. Do not share it with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const normalisedEmail = email.toLowerCase().trim();

  await connectDB();

  if (await User.findOne({ email: normalisedEmail }))
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const code = generateCode();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  // Generate a secure login token (used after verification instead of password)
  const loginToken = crypto.randomBytes(32).toString("hex");
  const loginTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await User.create({
    name,
    email: normalisedEmail,
    password: hashed,
    verified: false,
    verifyCode: code,
    verifyCodeExpiry: expiry,
    loginToken,
    loginTokenExpiry,
  });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: normalisedEmail,
    subject: `${code} is your Meal Planner verification code`,
    html: verifyEmail(name, code),
  });

  // Only email and token in URL — no password
  return NextResponse.json({
    message: "Check your email for a verification code",
    token: loginToken,
  }, { status: 201 });
}
