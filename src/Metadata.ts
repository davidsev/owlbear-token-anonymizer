import { Item } from '@owlbear-rodeo/sdk';
import { ItemMetadataMapper } from '@davidsev/owlbear-utils';
import getId from './getId';

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


