import { NextRequest, NextResponse } from "next/server";
import { GoogleDrive } from "@/authGoogle";

const googleDrive = new GoogleDrive();

export async function GET(request: NextRequest) {
    await googleDrive.initialize();

    const fileId = request.nextUrl.searchParams.get("fileId");

    if (!fileId) {
        return NextResponse.json(
            { error: "fileId is required" },
            { status: 400 }
        );
    }

    const downloadLink = await googleDrive.getTemporaryDownloadLink(fileId);
    if (typeof downloadLink === "string") {
        return NextResponse.redirect(downloadLink);
    } else {
        return downloadLink;
    }
}
