// app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Waitlist } from "@/models/waitlist";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function waitlistEmail(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You're on the waitlist</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;-webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#0a0a0a;border:1px solid #1e1e1e;">

          <!-- TOP ACCENT -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,#d4af37 0%,#f0d060 50%,#d4af37 100%);"></td>
          </tr>

          <!-- HEADER -->
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

          <!-- HERO -->
          <tr>
            <td style="padding:32px 32px 28px;">

              <!-- Eyebrow -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:16px;height:1px;background-color:#d4af37;vertical-align:middle;"></td>
                  <td style="padding-left:10px;">
                    <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;">Early Access</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:28px;line-height:1.15;color:#f0ece0;margin:0 0 16px;">
                You're on the list.
              </h1>

              <!-- Body -->
              <p style="font-family:'Courier New',monospace;font-size:11px;line-height:1.8;color:#555;margin:0 0 20px;">
                We'll reach out to <span style="color:#e8e4d8;">${email}</span> the moment we open early access. No spam — just one email when we're ready.
              </p>

              <!-- Email chip -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
                <tr>
                  <td style="background-color:#111;border:1px solid #1e1e1e;padding:8px 14px;">
                    <span style="font-family:'Courier New',monospace;font-size:10px;color:#d4af37;">${email}</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:1px;background-color:#1a1a1a;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- FEATURES -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#333;margin:0 0 16px;">What's coming</p>

              ${[
                ["📅", "Weekly meal planner"],
                ["📖", "Thousands of recipes"],
                ["🛒", "Smart shopping list"],
                ["🔒", "Private by default"],
              ].map(([icon, label]) => `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;width:100%;">
                <tr>
                  <td style="width:28px;height:28px;background-color:#111;border:1px solid #1e1e1e;text-align:center;vertical-align:middle;font-size:13px;">${icon}</td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:'Courier New',monospace;font-size:10px;color:#444;letter-spacing:1px;">${label}</span>
                  </td>
                </tr>
              </table>`).join("")}
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:1px;background-color:#1a1a1a;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:16px 32px;">
              <p style="font-family:'Courier New',monospace;font-size:8px;color:#2a2a2a;margin:0;letter-spacing:2px;line-height:1.8;text-transform:uppercase;">
                You're receiving this because you joined the Meal Planner waitlist.
              </p>
            </td>
          </tr>

          <!-- BOTTOM ACCENT -->
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
  const { email } = await req.json();

  if (!email?.trim())
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

  await connectDB();

  const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() });
  if (existing)
    return NextResponse.json({ error: "You're already on the list" }, { status: 409 });

  await Waitlist.create({ email });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "You're on the Meal Planner waitlist ✦",
    html: waitlistEmail(email),
  });

  return NextResponse.json({ message: "You're on the list" }, { status: 201 });
}