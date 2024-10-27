import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the JWT token from the request cookies.
 *
 * @param req - The request object.
 */
export function validateToken(
    req: NextRequest
): NextResponse<{ error: string }> | true | undefined {
    const token = req.cookies?.get("session_token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: "No token provided or found" },
            { status: 401 }
        );
    }

    const secretKey = process.env.PSWD;
    if (!secretKey) {
        throw new Error("Missing environment variable PSWD");
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Use the secret from environment variables
        if (decoded) {
            return true; // Return the decoded token if valid
        }
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 }); // Return null if the token is invalid
    }
}
