/* eslint-disable @typescript-eslint/no-unused-vars */
import { GoogleDrive } from "@/authGoogle";
import { validateToken } from "@/validateToken";
import { _writeBufferToFile, createZipFile } from "@/zip";
import { NextRequest, NextResponse } from "next/server";
// // Secret password for authentication
// const SECRET_PASSWORD = process.env.PSWD;

export async function GET(req: NextRequest) {
    const d = validateToken(req);
    if (!d) {
        return d;
    }

    const g = new GoogleDrive();
    await g.initialize();
    const b = await g.getFileBuffer("1OEdZLg5yosnBxX0N24KyLpxx-Cljm0EH");
    const c = await g.getFileBuffer("1E9nNUK4xd25AsA-7Up2bAmk6XdPCjMmF");

    const BUFFERS_NAMES = ((
        ...args: { buffer: Buffer; name: string }[]
    ): [Buffer[], string[]] => {
        const buffers = args.map(({ buffer }) => buffer);
        const names = args.map(({ name }) => name);
        return [buffers, names];
    })(b, c);

    const zipBuffer = await createZipFile(BUFFERS_NAMES[0], BUFFERS_NAMES[1]);

    // await _writeBufferToFile(zipBuffer, "plswork.zip");

    try {
        return new NextResponse(zipBuffer, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="downlo.zip"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred", details: error },
            { status: 500 }
        );
    }
}
