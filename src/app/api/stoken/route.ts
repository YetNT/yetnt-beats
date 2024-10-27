/**
 * ROUTE TO SET THE SESSION COOKIE OF THE USER
 */

// app/api/setSessionToken/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { simpleValidateToken } from "@/validateToken";

export async function GET(req: NextRequest) {
    const a = simpleValidateToken(req);
    if (a instanceof NextResponse) return a;
    // Generate a unique session ID
    const sessionId = uuidv4();

    // Check if the PSWD environment variable is defined
    const secretKey = process.env.PSWD;
    if (!secretKey) {
        throw new Error("Missing environment variable PSWD");
    }

    // Create a JWT with the session ID as the "user" payload
    const token = jwt.sign({ user: sessionId }, secretKey, { expiresIn: "1h" });

    // Set the session cookie
    cookies().set("session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600,
    });

    return NextResponse.json({ message: "Session token set successfully" });
}
