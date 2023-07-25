import { getOriginalItemMetadata, setFakeItemMetadata, setOriginalItemMetadata } from './Metadata';
import OBR, { buildImage, ImageContent, ImageGrid, Item } from '@owlbear-rodeo/sdk';

export async function hideItem (originalItem: Item) {
    const metadata = getOriginalItemMetadata(originalItem);
    const currentlyHidden = metadata.hidden;
    if (currentlyHidden)
        return;

    // Make the fake token.
    const fakeToken = buildImage((originalItem as any).image as ImageContent, (originalItem as any).grid as ImageGrid)
        .disableHit(true)
        .locked(true)
        .layer('MAP')
        .position(originalItem.position)
        .zIndex(originalItem.zIndex - 100)
        .build();
    setFakeItemMetadata(fakeToken, { originalTokenId: originalItem.id });

    // Hide the original and set the metadata.
    await OBR.scene.items.updateItems([originalItem], (items) => {
        for (const originalItem of items) {
            originalItem.visible = false;
            setOriginalItemMetadata(originalItem, { hidden: true, fakeTokenId: fakeToken.id });
        }
    });

    // Hide any attached items.
    const attachments = await OBR.scene.items.getItemAttachments([originalItem.id]);
    if (attachments.length) {
        await OBR.scene.items.updateItems(attachments, (items) => {
            for (const item of items) {
                if (!item.disableAttachmentBehavior?.includes('VISIBLE'))
                    item.visible = false;
            }
        });
    }

    // Add the fake token.  Needs to happen after the original token has it's metadata set, otherwise we'll remove it in the onChange handler.
    await OBR.scene.items.addItems([fakeToken]);
}

export async function showItem (originalItem: Item) {
    const metadata = getOriginalItemMetadata(originalItem);
    const currentlyHidden = metadata.hidden;
    if (!currentlyHidden)
        return;

    // Find the fake token.
    const fakeTokenId = metadata.fakeTokenId;
    if (fakeTokenId)
        await OBR.scene.items.deleteItems([fakeTokenId]);

    // Show the original and clear the metadata.
    await OBR.scene.items.updateItems([originalItem], (items) => {
        for (const originalItem of items) {
            originalItem.visible = true;
            setOriginalItemMetadata(originalItem, { hidden: false, fakeTokenId: null });
        }
    });

    // Show any attached items.
    const attachments = await OBR.scene.items.getItemAttachments([originalItem.id]);
    if (attachments.length) {
        await OBR.scene.items.updateItems(attachments, (items) => {
            for (const item of items) {
                if (!item.disableAttachmentBehavior?.includes('VISIBLE'))
                    item.visible = true;
            }
        });
    }
}
