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

            // Find any fake tokens where the original is deleted or moved.
            const fakeTokensToMove: Item[] = [];
            for (const fakeToken of fakeTokens.values()) {
                // Check if the original is deleted.
                if (!hiddenTokens.has(getFakeItemMetadata(fakeToken).originalTokenId!)) {
                    OBR.scene.items.deleteItems([fakeToken.id]);
                }

                const originalToken = hiddenTokens.get(getFakeItemMetadata(fakeToken).originalTokenId!);
                if (originalToken && (originalToken.position.x != fakeToken.position.x || originalToken.position.y != fakeToken.position.y || originalToken.scale.x != fakeToken.scale.x || originalToken.scale.y != fakeToken.scale.y || originalToken.rotation != fakeToken.rotation)) {
                    fakeTokensToMove.push(fakeToken);
                }
            }

            // Update the position of the fake tokens.
            if (fakeTokensToMove.length > 0)
                OBR.scene.items.updateItems(fakeTokensToMove, (items) => {
                    for (const fakeToken of items) {
                        // Update the position.
                        const originalToken = hiddenTokens.get(getFakeItemMetadata(fakeToken).originalTokenId!);
                        if (originalToken) {
                            fakeToken.position = originalToken.position;
                            fakeToken.rotation = originalToken.rotation;
                            fakeToken.scale = originalToken.scale;
                        }
                    }
                });
        });
    });
}
