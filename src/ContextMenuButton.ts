import { ContextMenuContext, ContextMenuIcon, ContextMenuItem } from '@owlbear-rodeo/sdk';
import getId from './getId';
import { getOriginalItemMetadata } from './Metadata';
import { hideItem, showItem } from './itemFunctions';

export class ContextMenuButton implements ContextMenuItem {
    id = getId('context-menu');

    icons: ContextMenuIcon[] = [{
        icon: '/icon.svg',
        label: 'Anonymize Token',
        filter: {
            roles: ['GM'],
            every: [
                { key: 'type', value: 'IMAGE' },
            ],
        },
    }];

    onClick (context: ContextMenuContext, elementId: string): void {
        // See if we are showing or hiding.  If any are currently visible, then hide them all.
        const hide = context.items.some((item) => !getOriginalItemMetadata(item).hidden);

        // Show or hide them all.
        for (const item of context.items) {
            if (hide)
                hideItem(item);
            else
                showItem(item);
        }
    }
}
