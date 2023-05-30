import OBR from '@owlbear-rodeo/sdk';
import { ContextMenuButton } from './ContextMenuButton';

export function initBackground () {
    OBR.onReady(async () => {
        OBR.contextMenu.create(new ContextMenuButton());
    });
}
