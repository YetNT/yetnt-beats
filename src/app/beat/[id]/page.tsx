import { GetBeatResponse } from '@/app/api/beat/route';
import Image from 'next/image';
// import { BeatJSON, File3MimeType } from '@/beatstypes';

// function bufferToBeatJSON(buffer: Buffer): BeatJSON {
//     const jsonString = buffer.toString('utf-8'); // Convert Buffer to string
//     const beat: BeatJSON = JSON.parse(jsonString); // Parse JSON string into object
//     return beat;
// }

interface BeatPageProps {
    params: {
        id: string;
    };
}

interface BeatImageProps {
    base64: string;
    mimeType: string;
}

async function cantFindBeat() {
    return (
        <h1>Yoh can&apos;t find the beat, hades boi.</h1>
    );
}

export function BeatImage({ base64, mimeType }: BeatImageProps) {
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return (
    <Image
        src={dataUrl}
        alt="Beat image"
        width={500} // Replace with your desired width
        height={300} // Replace with your desired height
    />
  );
}

// Fetches data dynamically on each request
export default async function BeatPage({ params }: BeatPageProps) {
    const { id } = params;
    const host = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000';
    try {
        const res = await fetch(`${host}/api/beat?id=${id}&json=false`, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const json: GetBeatResponse = await res.json() // This will read the body as JSON
        // const foundJSON = json.find((d) => d.mimeType === File3MimeType.JSON)?.str;
        // const beat = foundJSON ? bufferToBeatJSON(Buffer.from(foundJSON, "base64")) : undefined;
        const beat = json.filter(d => d.beat !== undefined)[0].beat;
        const image = json
            .filter(d => d.beat === undefined)
            .find(d => ["image/png", "image/jpeg"].includes(d.mimeType))


        // const beatFiles = json.filter((d) => d.mimeType === File3MimeType.JSON)

        if (!beat){
            cantFindBeat();
            return;
        }

        return (
            <div>
                <h1>{beat?.displayName}</h1>
                <p>Price: ${beat?.price}</p>
                <BeatImage base64={image?.str || ""} mimeType={image?.mimeType || "image/png"} />
                {/* Render other beat details */}
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch the beat data:", error);
        console.error(error)
            cantFindBeat();
    }
}
