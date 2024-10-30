import { IncomingBeatData } from "@/beatstypes";
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
        unatggedWav: formData.get("unatggedWav") as File | null,
        taggedWav: formData.get("taggedWav") as File | null,
        price: formData.get("price") as string | null,
        taggedMp3: formData.get("waggedMp3") as File | null,
    };

    console.log(beatData); // For testing purposes

    return NextResponse.json(
        { beatData, message: "File and data received successfully" },
        { status: 200 }
    );
}
