import { NextRequest, NextResponse } from "next/server";
import { GoogleDrive } from "@/authGoogle";
import { BeatJSON, File3Images, File3MimeType } from "@/beatstypes";

// export type GetBeatResponse =
//     | {
//           id: string;
//           name: string;
//           mimeType: File3MimeType;
//           str: string;
//       }[]
//     | { beat: BeatJSON }[];

export type GetBeatResponse = Array<
    | { beat: BeatJSON }
    | {
          id: string;
          name: string;
          mimeType: File3MimeType;
          str: string;
          beat: undefined;
      }
    | {
          id: string;
          name: string;
          mimeType: File3Images;
          str: string;
          beat: undefined;
      }
>;

export async function GET(req: NextRequest) {
    const g = new GoogleDrive();
    await g.initialize();

    const b = await g.listAndSortBeats();
    const beatId = req.nextUrl.searchParams.get("id") || "";
    const getOnlyJson = req.nextUrl.searchParams.get("json")
        ? JSON.parse(req.nextUrl.searchParams.get("json") || "true")
        : true;

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
                const buffer = (await g.getFileBuffer(file.id)).buffer;
                if (file.mimeType == File3MimeType.JSON) {
                    const beat = JSON.parse(buffer?.toString("utf-8") || "");
                    return {
                        beat,
                    };
                } else {
                    return {
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        str: buffer?.toString("base64"),
                        beat: undefined,
                    };
                }
            })
    );

    if (getOnlyJson) beatFiles.filter((file) => file.beat !== undefined);

    return NextResponse.json(beatFiles as GetBeatResponse, {
        status: 200,
    });
}
