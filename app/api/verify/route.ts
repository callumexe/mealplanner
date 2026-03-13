// app/api/verify/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code)
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });

  const normalisedEmail = email.toLowerCase().trim();
  const trimmedCode = code.toString().trim();

  await connectDB();

  // Use .select("+verifyCode +verifyCodeExpiry") to ensure fields are returned
  const user = await User.findOne({ email: normalisedEmail }).select(
    "verified verifyCode verifyCodeExpiry"
  );

  if (!user)
    return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (user.verified)
    return NextResponse.json({ message: "Already verified" }, { status: 200 });

  // Log everything so we can debug
  console.log("=== VERIFY DEBUG ===");
  console.log("stored code:", JSON.stringify(user.verifyCode));
  console.log("received code:", JSON.stringify(trimmedCode));
  console.log("expiry:", user.verifyCodeExpiry);
  console.log("now:", new Date());
  console.log("expired?", !user.verifyCodeExpiry || new Date() > user.verifyCodeExpiry);
  console.log("====================");

  if (!user.verifyCode)
    return NextResponse.json({ error: "No verification code found — please register again" }, { status: 400 });

  if (user.verifyCode !== trimmedCode)
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });

  if (!user.verifyCodeExpiry || new Date() > user.verifyCodeExpiry)
    return NextResponse.json({ error: "Code has expired — please register again" }, { status: 400 });

  // Mark verified and clear code
  await User.updateOne(
    { email: normalisedEmail },
    { $set: { verified: true }, $unset: { verifyCode: "", verifyCodeExpiry: "" } }
  );

  return NextResponse.json({ message: "Email verified" }, { status: 200 });
}