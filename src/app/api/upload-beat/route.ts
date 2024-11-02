import { GoogleDrive } from "@/authGoogle";
import {
    convertIncomingBeatData,
    File3MimeType,
    IncomingBeatData,
} from "@/beatstypes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const beatData: IncomingBeatData = {
        name: formData.get("name") as string | null,
        bpm: formData.get("bpm") as string | null,
        key: formData.get("key") as string | null,
        description: formData.get("description") as string | null,
        licenses: formData.get("licenses") as string | null,
        coAuthors: formData.get("coAuthors") as string | null,
        tags: formData.get("tags") as string | null,
        untaggedWav: formData.get("untaggedWav") as File | null,
        taggedWav: formData.get("taggedWav") as File | null,
        price: formData.get("price") as string | null,
        image: formData.get("image") as File | null,
        taggedMp3: formData.get("taggedMp3") as File | null,
    };

    await uploadBeat(beatData);

    return NextResponse.json(
        { beatData, message: "File and data received successfully" },
        { status: 200 }
    );
}

type BeatFiles = {
    b: Buffer;
    mimeType: string;
    name: string;
    id: string;
}[];

async function uploadBeat(beatData: IncomingBeatData) {
    const beat = convertIncomingBeatData(beatData);
    const beatId = `${beat.name}_${beat.bpm}bpm_${beat.key || ""}`.replace(
        /\s/g,
        "-"
    );
    const g = new GoogleDrive();
    g.initialize();
    const beatsFolderid = "10SEHzjOMjHIErmlSLBAlYx7S4NxgdkAy";
    const beatFolder = await g.createFileOrFolder(beatsFolderid, beatId, true); // currently make beat folder for the beat

    await g.createFileOrFolder(
        beatFolder || "",
        `${beatId}.png`,
        File3MimeType.PNG,
        Buffer.from(await beat.image.arrayBuffer())
    );

    const beats: BeatFiles = await Promise.all(
        [
            {
                file: beat.untaggedWav,
                mimeType: File3MimeType.WAV,
                name: `${beatId}.wav`,
            },
            {
                file: beat.taggedWav,
                mimeType: File3MimeType.WAV,
                name: `T_${beatId}.wav`,
            },
            {
                file: beat.taggedMp3,
                mimeType: File3MimeType.MP3,
                name: `T_${beatId}.mp3`,
            },
        ].map(async ({ file, mimeType, name }) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const id = await g.createFileOrFolder(
                beatFolder || "",
                name,
                mimeType,
                buffer
            );

            return { b: buffer, mimeType, name, id: id || "" };
        })
    );

    const beatMetadata = {
        name: beat.name,
        description: beat.description,
        bpm: beat.bpm,
        key: beat.key,
        tags: beat.tags,
        licenses: beat.licenses,
        coAuthors: beat.coAuthors,
        price: beat.price,
    };

    await g.createFileOrFolder(
        beatFolder || "",
        `${beatId}.json`,
        File3MimeType.JSON,
        Buffer.from(JSON.stringify(beatMetadata))
    );

    return beats;
}
