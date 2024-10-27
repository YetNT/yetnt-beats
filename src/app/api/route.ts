import { validateToken } from "@/validateToken";
import { NextRequest, NextResponse } from "next/server";
// // Secret password for authentication
// const SECRET_PASSWORD = process.env.PSWD;

export async function GET(req: NextRequest) {
    const d = validateToken(req);
    if (!d) {
        return NextResponse.json(
            { error: "Invalid token" },
            {
                status: 401,
            }
        );
    }

    try {
        return NextResponse.json(
            {
                j: req.geo,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred", details: error },
            { status: 500 }
        );
    }
}
