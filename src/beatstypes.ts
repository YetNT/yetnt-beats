export interface IncomingBeatData {
    name: string | null;
    bpm: string | null;
    key: string | null;
    description: string | null;
    licenses: string | null;
    coAuthors: string | null;
    tags: string | null;
    unatggedWav: File | null;
    taggedWav: File | null;
    taggedMp3: File | null;
    price: string | null;
}

export interface BeatData {
    name: string;
    bpm: string;
    key?: string;
    description: string;
    licenses: Licenses[];
    coAuthors?: string[];
    tags: Tags[];
    unatggedWav: File;
    taggedWav: File;
    taggedMp3: File;
    price?: number;
}

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
        bpm: incoming.bpm || "",
        key: incoming.key || "",
        description: incoming.description || "",
        licenses,
        coAuthors,
        tags,
        unatggedWav: incoming.unatggedWav!,
        taggedWav: incoming.taggedWav!,
        taggedMp3: incoming.taggedMp3!,
        price: incoming.price ? parseFloat(incoming.price) : undefined,
    };

    return beatData;
}
