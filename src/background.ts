import OBR, { Item } from '@owlbear-rodeo/sdk';
import { ContextMenuButton } from './ContextMenuButton';
import { getFakeItemMetadata, getOriginalItemMetadata } from './Metadata';
import { showItem } from './itemFunctions';

export function initBackground () {
    OBR.onReady(async () => {
        // Set up the context menu.
        OBR.contextMenu.create(new ContextMenuButton());

        // Fix tokens when manually un-hidden.
        OBR.scene.items.onChange(function (items: Item[]) {
            // Filter just our stuff.
            const hiddenTokens: Map<string, Item> = new Map();
            const fakeTokens: Map<string, Item> = new Map();
            for (const item of items) {
                if (getOriginalItemMetadata(item).hidden)
                    hiddenTokens.set(item.id, item);
                if (getFakeItemMetadata(item).originalTokenId)
                    fakeTokens.set(item.id, item);
            }

            // For the hidden tokens, remove the fake if they have been un-hidden.
            for (const hiddenToken of hiddenTokens.values()) {
                if (hiddenToken.visible)
                    showItem(hiddenToken);
            }

            // For the fake tokens, remove them if the original is deleted, otherwise fix the position.
            OBR.scene.items.updateItems([...fakeTokens.values()], (items) => {
                for (const fakeToken of items) {
                    // Check if the original is deleted.
                    if (!hiddenTokens.has(getFakeItemMetadata(fakeToken).originalTokenId!)) {
                        OBR.scene.items.deleteItems([fakeToken.id]);
                    }

                    // Update the position.
                    const originalToken = hiddenTokens.get(getFakeItemMetadata(fakeToken).originalTokenId!);
                    if (originalToken && (originalToken.position.x != fakeToken.position.y || originalToken.position.y != fakeToken.position.y || originalToken.scale != fakeToken.scale || originalToken.rotation != fakeToken.rotation)) {
                        fakeToken.position = originalToken.position;
                        fakeToken.rotation = originalToken.rotation;
                        fakeToken.scale = originalToken.scale;
                    }
                }
            });
        });
    });
}
