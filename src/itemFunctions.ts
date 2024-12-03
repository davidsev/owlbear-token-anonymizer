import { fakeItemMetadata, originalItemMetadata } from './Metadata';
import OBR, { buildImage, Image, ImageContent, ImageGrid, isImage, Item } from '@owlbear-rodeo/sdk';

export async function hideItem (originalItems: Item[]) {

    // Filter out the items that are already hidden, and bail if there are none to hide.
    const itemsToHide = originalItems.filter((item) => !originalItemMetadata.get(item).hidden);
    if (itemsToHide.length === 0)
        return;

    // Make the fake tokens.
    const fakeTokens = new Map<string, Image>();
    for (const originalItem of originalItems) {
        if (!isImage(originalItem))
            continue;

        const fakeToken = buildImage(originalItem.image as ImageContent, originalItem.grid as ImageGrid)
            .disableHit(true)
            .locked(true)
            .name('Anonymized ' + (originalItem.name || 'Token'))
            .layer('MAP')
            .position(originalItem.position)
            .zIndex(originalItem.zIndex - 100)
            .build();
        fakeItemMetadata.set(fakeToken, { originalTokenId: originalItem.id });
        fakeTokens.set(originalItem.id, fakeToken);
    }

    // Hide the original and set the metadata.
    await OBR.scene.items.updateItems(originalItems, (items) => {
        for (const originalItem of items) {
            const fakeToken = fakeTokens.get(originalItem.id);
            if (fakeToken) {
                originalItem.visible = false;
                originalItemMetadata.set(originalItem, { hidden: true, fakeTokenId: fakeToken.id });
            }
        }
    });

    // Add the fake token.  Needs to happen after the original token has it's metadata set, otherwise we'll remove it in the onChange handler.
    await OBR.scene.items.addItems([...fakeTokens.values()]);
}

export async function showItem (originalItems: Item[]) {

    // Filter out the items that aren't hidden, and bail if there are none to show.
    const itemsToShow = originalItems.filter((item) => originalItemMetadata.get(item).hidden);
    if (itemsToShow.length === 0)
        return;

    // Find the fake token IDs.
    const fakeTokenIds = originalItems.map(originalItem => {
        const metadata = originalItemMetadata.get(originalItem);
        return metadata.fakeTokenId;
    }).filter(x => x) as string[];

    await OBR.scene.items.deleteItems(fakeTokenIds);

    // Show the original and clear the metadata.
    await OBR.scene.items.updateItems(originalItems, (items) => {
        for (const originalItem of items) {
            originalItem.visible = true;
            originalItemMetadata.set(originalItem, { hidden: false, fakeTokenId: null });
        }
    });
}
