import { google, drive_v3 } from "googleapis";
import stream from "stream";
import { NextResponse } from "next/server"; // Importing NextRequest and NextResponse
import { SortedBeats } from "./beatstypes";

export class GoogleDrive {
    private drive: drive_v3.Drive;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private authClient: any | undefined;

    private credentials:
        | { client_email: string | undefined; private_key: string | undefined }
        | undefined; // Holds the decoded JSON key for authentication

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

        this.credentials = JSON.parse(credentials);

        // Get the authenticated client
        this.authClient = await auth.getClient();
        google.options({ auth: this.authClient });
        this.drive = google.drive({ version: "v3", auth: this.authClient });
    }

    async listFiles(pageSize?: number, beatId?: string) {
        google.options({ auth: this.authClient });

        const res = await this.drive.files.list(
            pageSize
                ? {
                      q: "trashed=false",
                      pageSize,
                      // fields: "files(id, name)",
                  }
                : {
                      q: "trashed=false",
                  }
        );
        return !beatId
            ? res.data.files
            : res.data.files?.filter((file) => file.name?.includes(beatId));
    }

    /**
     * Retrieves a list of files from Google Drive, filters them to only include JSON files,
     * extracts the beat IDs from the file names, and then sorts the beats based on their IDs.
     *
     * @remarks
     * This function assumes that the `listFiles` method has already been implemented and returns
     * an array of `drive_v3.Schema$File` objects.
     *
     * @returns An array of objects, where each object represents a beat and contains its ID and
     * associated files from Google Drive.
     *
     * @throws Will throw an error if there's an issue retrieving files from Google Drive.
     */
    async listAndSortBeats() {
        const files = (await this.listFiles()) || [];
        const JSONfiles = files.filter((file) => file.name?.endsWith(".json"));

        const beatIds = [
            ...new Set(JSONfiles.map((file) => file.name?.slice(0, -5) || "")),
        ];

        const sortedBeats = beatIds.map((id) => {
            return { id, files: files.filter((f) => f.name?.includes(id)) };
        }) as SortedBeats;

        return sortedBeats;
    }

    /**
     * Fuck it we ball
     *
     * Deletes all files from the Google Drive.
     *
     * This function retrieves a list of all files from Google Drive using the `listFiles` method,
     * then iterates through each file and deletes it using the Google Drive API.
     *
     * @remarks
     * This function assumes that the `listFiles` method has already been implemented and returns
     * an array of `drive_v3.Schema$File` objects.
     *
     * @throws Will throw an error if there's an issue retrieving files from Google Drive or deleting them.
     */
    async deleteAllFiles() {
        google.options({ auth: this.authClient });
        try {
            const files = (await this.listFiles()) || [];
            for (const file of files) {
                await this.drive.files.delete({ fileId: file.id || "" });
                console.log(`Deleted file ${file.id}`);
            }
            console.log("All files deleted successfully");
        } catch (error) {
            console.error("Error deleting files:", error);
        }
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

    async getFileBuffer(
        fileId: string,
        stream: boolean = false
    ): Promise<{
        buffer?: Buffer;
        stream?: NodeJS.ReadableStream;
        name: string;
    }> {
        google.options({ auth: this.authClient });

        const metadataRes = await this.drive.files.get({
            fileId,
            fields: "name",
            supportsAllDrives: true,
        });

        const name = metadataRes.data.name || "";

        return new Promise((resolve, reject) => {
            this.drive.files.get(
                { fileId, alt: "media", supportsAllDrives: true },
                { responseType: "stream" },
                (err, res) => {
                    if (err) {
                        return reject("The API returned an error: " + err);
                    }

                    if (!res) {
                        return reject("No response received from API");
                    }

                    const data = res.data as unknown as NodeJS.ReadableStream;

                    // If `stream` parameter is true, return the stream directly
                    if (stream) {
                        resolve({ stream: data, name });
                    } else {
                        // Otherwise, accumulate chunks into a buffer
                        const buf: Buffer[] = [];
                        data.on("data", (chunk) => {
                            buf.push(chunk);
                        });
                        data.on("end", () => {
                            const buffer = Buffer.concat(buf);
                            resolve({ buffer, name });
                        });
                    }
                }
            );
        });
    }

    async _JWTClient() {
        // Configure JWT auth client
        const jwtClient = new google.auth.JWT(
            this.credentials?.client_email,
            undefined,
            this.credentials?.private_key,
            ["https://www.googleapis.com/auth/drive"]
        );

        // Authenticate request
        jwtClient.authorize(function (err) {
            if (err) {
                return;
            }
        });

        return jwtClient;
    }

    /**
     * Creates (uploads) a new file or folder in Google Drive.
     *
     * @param parentFolderId - The ID of the parent folder where the new file or folder will be created.
     * @param name - The name of the new file or folder.
     * @param mimeTypeOrIsFolder - The MIME type of the new file or `true` if it's a folder.
     * @param buffer - Optional. The content of the file to be created. If not provided, a folder will be created.
     *
     * @returns The ID of the newly created file or folder.
     *
     * @throws Will throw an error if there's an issue creating the file or folder.
     */
    async createFileOrFolder(
        parentFolderId: string,
        name: string,
        mimeTypeOrIsFolder: string | boolean,
        buffer?: Buffer
    ) {
        google.options({ auth: this.authClient });

        const fileMetadata = {
            name: name,
            mimeType:
                mimeTypeOrIsFolder === true
                    ? "application/vnd.google-apps.folder"
                    : (mimeTypeOrIsFolder as string),
            parents: [parentFolderId],
        };

        const media = buffer
            ? { body: new stream.PassThrough().end(buffer) }
            : undefined;

        try {
            const response = await this.drive.files.create({
                auth: await this._JWTClient(),
                requestBody: fileMetadata,
                media,
                fields: "id",
            });

            return response.data.id;
        } catch (error) {
            console.error("Error creating the file/folder:", error);
            throw error;
        }
    }
}
