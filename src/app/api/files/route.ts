import { NextRequest } from "next/server";
import { GoogleDrive } from "@/authGoogle";

export async function GET(req: NextRequest) {
    const g = new GoogleDrive();
    await g.initialize();

    const pageSize = Number(req.nextUrl.searchParams.get("size")) || 10;

    const b = g.listFiles(req, pageSize);
    return b;
}
