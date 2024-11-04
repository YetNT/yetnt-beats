export interface IncomingBeatData {
    name: string | null;
    displayName: string | null;
    bpm: string | null;
    key: string | null;
    description: string | null;
    licenses: string | null;
    coAuthors: string | null;
    tags: string | null;
    untaggedWav: File | null;
    image: File | null;
    taggedWav: File | null;
    taggedMp3: File | null;
    price: string | null;
}

export interface BeatData {
    name: string;
    bpm: number;
    key?: string;
    displayName: string;
    description: string;
    image: File;
    licenses: Licenses[];
    coAuthors?: string[];
    tags: Tags[];
    untaggedWav: File;
    taggedWav: File;
    taggedMp3: File;
    price?: number;
}

export type BeatJSON = {
    name: string;
    id: string;
    displayName: string;
    description: string;
    bpm: number;
    key: string;
    tags: Tags[];
    licenses: Licenses[];
    coAuthors: string[];
    price: number;
};

export enum Tags {
    DETROIT = "detroit",
    FLINT = "flint",
    HARD = "hard",
    SUPERTRAP = "supertrap",
    CHILL = "chill",
    FIRE = "fire",
    MICHIGAN = "michigan",
    LOOP = "loop",
    SAMPLE = "sample",
    BEAT = "beat",
    FREE = "free",
    RIO = "rio da yung og",
    RMC = "rmc mike",
    FXCE = "babyfxce e",
    KIDD = "krispyliffe kidd",
    GHARD = "grindhard e",
    BFB = "bfb da packman",
    ENRGY = "erngy",
    TB = "type beat",
    BLX = "blxckie",
    BRA = "k1llbrady",
    NTM = "newtankmerc",
    KUPA = "brotherkupa",
    JAY = "jaykatana",
    UNDR = "sa underground",
}
export const TAGS_ARRAY = Object.values(Tags);

export enum Licenses {
    FREE_TAGGED = 0, // beat is free, but its only the mp3, its tagged and you must credit.

    COMMON_RIGHTS = 1, // can upload anywhere but with tag and if streaming reaches threshold, skyf money boi

    EXCLUSIVE_RIGHTS = 2, // can upload anywhere without tag, credits in song metadata still appreciated
    // Excluive rights will always be a license if the beat has a price. If it has no price then it defaults to the FREE_TAGGED

    MULTI_PROD_RIGHTS = 3, // if beat has co authors, this comes in handy

    AGREEMENT_RIGHTS = 4, // buyer can bargain price. Avoid using this.
}
export const LICENSES_MAP = {
    "Free Tagged": Licenses.FREE_TAGGED,
    "Common Rights": Licenses.COMMON_RIGHTS,
    "Exclusive Rights": Licenses.EXCLUSIVE_RIGHTS,
    "Multi-Prod Rights": Licenses.MULTI_PROD_RIGHTS,
    "Agreement Rights": Licenses.AGREEMENT_RIGHTS,
};

export function convertIncomingBeatData(incoming: IncomingBeatData): BeatData {
    const licenses = incoming.licenses
        ? (incoming.licenses.split(",").map(Number) as Licenses[])
        : [];
    const coAuthors = incoming.coAuthors ? incoming.coAuthors.split(",") : [];
    const tags = incoming.tags
        ? incoming.tags.split(",").map((tag) => tag as Tags)
        : [];

    const beatData: BeatData = {
        name: incoming.name || "",
        bpm: incoming.bpm ? parseFloat(incoming.bpm) : 0,
        key: incoming.key || "",
        description: incoming.description || "",
        licenses,
        coAuthors,
        tags,
        displayName: incoming.displayName || "null",
        untaggedWav: incoming.untaggedWav!,
        image: incoming.image!,
        taggedWav: incoming.taggedWav!,
        taggedMp3: incoming.taggedMp3!,
        price: incoming.price ? parseFloat(incoming.price) : undefined,
    };

    if (
        beatData.coAuthors?.length !== 0 &&
        !beatData.licenses?.includes(Licenses.MULTI_PROD_RIGHTS)
    )
        beatData.licenses.push(Licenses.MULTI_PROD_RIGHTS); // If co authors exist and multi prod rights aren't enabled, enable it

    if (
        beatData.price === undefined &&
        !beatData.licenses?.includes(Licenses.FREE_TAGGED)
    )
        beatData.licenses.push(Licenses.FREE_TAGGED); // if there's no price and free licence isn't there, push it.

    return beatData;
}

export enum File3MimeType {
    WAV = "audio/wav",
    MP3 = "audio/mp3",
    JSON = "application/json",
    PNG = "image/png",
    FOLDER = "application/vnd.google-apps.folder",
}

export type SortedBeats = {
    id: string;
    files: {
        mimeType: File3MimeType;
        id: string;
        name: string;
    }[];
}[];
