import { google, drive_v3 } from "googleapis";
import { NextRequest, NextResponse } from "next/server"; // Importing NextRequest and NextResponse

export class GoogleDrive {
    private drive: drive_v3.Drive;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private authClient: any | undefined;

    constructor() {
        // Initialize the drive but don't set it yet
        this.drive = google.drive({ version: "v3" });
    }

    // Async initialization method
    async initialize() {
        // Decode the JSON key
        const credentials = Buffer.from(
            process.env.GOOGLE_KEY as string,
            "base64"
        ).toString("utf8");

        // Create a new GoogleAuth instance
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(credentials),
            scopes: [
                "https://www.googleapis.com/auth/drive", // Full access to Google Drive
                "https://www.googleapis.com/auth/drive.file", // Access to files created or opened by the app
                "https://www.googleapis.com/auth/drive.metadata", // Access to file metadata
                "https://www.googleapis.com/auth/drive.readonly", // Read-only access
                "https://www.googleapis.com/auth/drive.metadata.readonly", // Read-only access to file metadata
                "https://www.googleapis.com/auth/drive.appdata", // Access to application data
                "https://www.googleapis.com/auth/drive.meet.readonly",
                "https://www.googleapis.com/auth/drive.photos.readonly",
            ],
        });

        // Get the authenticated client
        this.authClient = await auth.getClient();
        google.options({ auth: this.authClient });
        this.drive = google.drive({ version: "v3", auth: this.authClient });
    }

    async listFiles(
        request: NextRequest,
        pageSize: number
    ): Promise<NextResponse> {
        google.options({ auth: this.authClient });

        const res = await this.drive.files.list({
            pageSize,
            // fields: "files(id, name)",
        });
        return NextResponse.json(res.data.files); // Return the list of files as JSON
    }

    async getTemporaryDownloadLink(
        fileId: string
    ): Promise<NextResponse | string> {
        google.options({ auth: this.authClient });

        const res = await this.drive.files.get({
            fileId,
            fields: "webContentLink", // Get the web content link
        });

        // If the file is accessible and has a download link
        if (res.data.webContentLink) {
            return res.data.webContentLink;
        } else {
            return NextResponse.json(
                {
                    error: "No download link available for this file",
                },
                { status: 401 }
            );
        }
    }
}

// Example usage
// (async () => {
//     const googleDrive = new GoogleDrive();

//     // List files
//     const files = await googleDrive.listFiles();

//     if (files.length > 0) {
//         const fileId = files[0].id; // Get the ID of the first file
//         try {
//             const downloadLink = await googleDrive.getTemporaryDownloadLink(
//                 fileId
//             );
//             console.log("Temporary Download Link:", downloadLink);

//             // Here, you would typically send this link to the client for download.
//         } catch (error) {
//             console.error("Error generating download link:", error);
//         }
//     }
// })().catch(console.error);
