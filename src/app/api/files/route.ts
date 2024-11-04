import { NextResponse } from "next/server";
// import { NextResponse, NextRequest } from "next/server";
import { GoogleDrive } from "@/authGoogle";

export async function GET() {
    // export async function GET(req: NextRequest) {
    const g = new GoogleDrive();
    await g.initialize();

    const b = await g.listAndSortBeats();
    // const pageSize = Number(req.nextUrl.searchParams.get("size"));
    // const beatId = req.nextUrl.searchParams.get("beatId");

    // const b = await g.listFiles(pageSize, beatId || undefined);
    return NextResponse.json(b);
}
