import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
/**
 * Creates a zip file from an array of buffers and corresponding file names.
 *
 * @param buffers - An array of {@link Buffer} objects representing the file contents.
 * @param names - An array of strings representing the file names. The length of this array must match the length of the `buffers` array.
 *
 * @returns A Promise that resolves to a {@link Buffer} containing the zip file data.
 *
 * @example
 * const buffers = [Buffer.from('file1 content'), Buffer.from('file2 content')];
const names = ['file1.txt', 'file2.txt'];
createZipFile(buffers, names)
    .then(zipBuffer => {
        console.log('Zip file created:', zipBuffer);
        // You can now save this buffer to a file or send it as needed
    })
    .catch(err => {
        console.error('Error creating zip file:', err);
    
 *
 */
export async function createZipFile(
    buffers: Buffer[],
    names: string[]
): Promise<Buffer> {
    const zip = new AdmZip();
    buffers.forEach((buf, index) => {
        zip.addFile(names[index], buf);
    });
    return zip.toBuffer();
}

export async function _writeBufferToFile(buffer: Buffer, filename: string) {
    const filePath = path.join(__dirname, filename);
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log(`File written successfully to ${filePath}`);
        }
    });
}
