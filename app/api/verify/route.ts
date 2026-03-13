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

  const user = await User.findOne({ email: normalisedEmail });

  if (!user)
    return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (user.verified)
    return NextResponse.json({ message: "Already verified" }, { status: 200 });

  if (!user.verifyCode)
    return NextResponse.json({ error: "No verification code found — please register again" }, { status: 400 });

  if (user.verifyCode !== trimmedCode)
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });

  if (!user.verifyCodeExpiry || new Date() > user.verifyCodeExpiry)
    return NextResponse.json({ error: "Code has expired — please register again" }, { status: 400 });

  // Mark verified, clear code, keep loginToken for auto sign-in
  await User.updateOne(
    { email: normalisedEmail },
    {
      $set: { verified: true },
      $unset: { verifyCode: "", verifyCodeExpiry: "" },
    }
  );

  return NextResponse.json({ message: "Email verified" }, { status: 200 });
}

// Separate endpoint to exchange loginToken for a session
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email)
    return NextResponse.json({ error: "Missing token or email" }, { status: 400 });

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.loginToken !== token)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  if (!user.loginTokenExpiry || new Date() > user.loginTokenExpiry)
    return NextResponse.json({ error: "Token expired" }, { status: 400 });

  // Clear the login token after use
  await User.updateOne(
    { email: email.toLowerCase().trim() },
    { $unset: { loginToken: "", loginTokenExpiry: "" } }
  );

  // Return the user's email so the client can sign in with credentials
  return NextResponse.json({ email: user.email, verified: true }, { status: 200 });
}
