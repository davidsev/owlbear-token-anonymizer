import { Item, Metadata } from '@owlbear-rodeo/sdk';
import getId from './getId';

// Merge a metadata object with default values into the correct type.
function cleanMetadata<T extends Metadata> (metadata: Metadata, defaultValues: T): T {
    // If the metadata is missing any keys, fill them in with the defaults.
    for (const key in defaultValues)
        if (metadata[key] === undefined || metadata[key] === null)
            metadata[key] = defaultValues[key];

    return metadata as T;
}

//
// Item Metadata for the original item.
//

export interface OriginalItemMetadata extends Metadata {
    hidden: boolean,
    fakeTokenId: string | null,
}

export const defaultOriginalItemMetadata: OriginalItemMetadata = {
    hidden: false,
    fakeTokenId: null,
};

export function getOriginalItemMetadata (item: Item): OriginalItemMetadata {
    const metadata = (item.metadata[getId('original-item')] || {}) as Metadata;
    return cleanOriginalItemMetadata(metadata);
}

export function setOriginalItemMetadata (item: Item, metadata: Partial<OriginalItemMetadata>): void {
    item.metadata[getId('original-item')] = metadata;
}

export function cleanOriginalItemMetadata (metadata: Metadata): OriginalItemMetadata {
    return cleanMetadata(metadata, defaultOriginalItemMetadata);
}

//
// Item Metadata for the fake item.
//

export interface FakeItemMetadata extends Metadata {
    originalTokenId: string | null,
}

export const defaultFakeItemMetadata: FakeItemMetadata = {
    originalTokenId: null,
};

export function getFakeItemMetadata (item: Item): FakeItemMetadata {
    const metadata = (item.metadata[getId('fake-item')] || {}) as Metadata;
    return cleanFakeItemMetadata(metadata);
}

export function setFakeItemMetadata (item: Item, metadata: Partial<OriginalItemMetadata>): void {
    item.metadata[getId('fake-item')] = metadata;
}

export function cleanFakeItemMetadata (metadata: Metadata): FakeItemMetadata {
    return cleanMetadata(metadata, defaultFakeItemMetadata);
}
