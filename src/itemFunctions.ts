import { fakeItemMetadata, originalItemMetadata } from './Metadata';
import OBR, { buildImage, Image, isImage, Item } from '@owlbear-rodeo/sdk';

async function getTargetImages (originalItems: Item[], state: { hidden: boolean }): Promise<Image[]> {
    if (!originalItems.length)
        return [];

    const allItems = await OBR.scene.items.getItemAttachments(originalItems.map(item => item.id));
    return allItems
        .filter(isImage)
        .filter(item => originalItemMetadata.get(item).hidden === state.hidden);
}

export async function hideItem (originalItems: Item[]) {

    const itemsToHide = await getTargetImages(originalItems, { hidden: false });

    // Make the fake tokens.
    const fakeTokens = new Map<string, Image>();
    for (const originalItem of itemsToHide) {
        const fakeToken = buildImage(originalItem.image, originalItem.grid)
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
    await OBR.scene.items.updateItems(itemsToHide, (items) => {
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

    const itemsToShow = await getTargetImages(originalItems, { hidden: true });

    // Find the fake token IDs.
    const fakeTokenIds = itemsToShow.map(originalItem => {
        const metadata = originalItemMetadata.get(originalItem);
        return metadata.fakeTokenId;
    }).filter(x => x) as string[];

    await OBR.scene.items.deleteItems(fakeTokenIds);

    // Show the original and clear the metadata.
    await OBR.scene.items.updateItems(itemsToShow, (items) => {
        for (const originalItem of items) {
            originalItem.visible = true;
            originalItemMetadata.set(originalItem, { hidden: false, fakeTokenId: null });
        }
    });
}
