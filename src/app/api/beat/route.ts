import { NextRequest, NextResponse } from "next/server";
import { GoogleDrive } from "@/authGoogle";
import { File3MimeType } from "@/beatstypes";

export type GetBeatResponse = {
    id: string;
    name: string;
    mimeType: File3MimeType;
    str: NodeJS.ReadableStream;
}[];

export async function GET(req: NextRequest) {
    const g = new GoogleDrive();
    await g.initialize();

    const b = await g.listAndSortBeats();
    const beatId = req.nextUrl.searchParams.get("id") || "";

    const beat = b.find((beat) => beat.id === beatId);

    if (!beat) {
        return NextResponse.json(
            { message: "Beat not found" },
            { status: 404 }
        );
    }

    const beatFiles = await Promise.all(
        beat.files
            .filter((file) => file.mimeType !== File3MimeType.FOLDER)
            .map(async (file) => {
                const str = (await g.getFileBuffer(file.id, true)).stream;
                return {
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                    str,
                };
            })
    );

    console.log(beatFiles);
    return NextResponse.json(beatFiles as GetBeatResponse, {
        status: 200,
    });
}
