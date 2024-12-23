import { ContextMenuContext, ContextMenuIcon, ContextMenuItem } from '@owlbear-rodeo/sdk';
import getId from './getId';
import { originalItemMetadata } from './Metadata';
import { hideItem, showItem } from './itemFunctions';

export class ContextMenuButton implements ContextMenuItem {
    id = getId('context-menu');

    icons: ContextMenuIcon[] = [{
        icon: '/disable.svg',
        label: 'Unanonymize Token',
        filter: {
            roles: ['GM'],
            every: [
                { key: 'type', value: 'IMAGE' },
                { key: ['metadata', getId('original-item'), 'hidden'], value: true },
            ],
        },
    }, {
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
        const hide = context.items.some((item) => !originalItemMetadata.get(item).hidden);

        // Show or hide them all.
        if (hide)
            hideItem(context.items);
        else
            showItem(context.items);
    }
}
