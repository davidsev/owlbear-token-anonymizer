import { Item, Metadata } from '@owlbear-rodeo/sdk';
import { ItemMetadataMapper } from '@davidsev/owlbear-utils';
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

export class OriginalItemMetadata {
    hidden: boolean = false;
    fakeTokenId: string | null = null;
}

export const originalItemMetadata = new ItemMetadataMapper(getId('original-item'), new OriginalItemMetadata);

//
// Item Metadata for the fake item.
//

export function getFakeItemMetadata (item: Item): FakeItemMetadata {
    return fakeItemMetadata.get(item);
}

export class FakeItemMetadata {
    originalTokenId: string | null = null;
}

export const fakeItemMetadata = new ItemMetadataMapper(getId('fake-item'), new FakeItemMetadata);


