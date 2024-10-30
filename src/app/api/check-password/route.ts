import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Validate the token

    const password = req.nextUrl.searchParams.get("password");
    return password === process.env.SO_MANY_PSWD
        ? NextResponse.json({ res: true }, { status: 200 })
        : NextResponse.json({ res: false }, { status: 401 });
}
