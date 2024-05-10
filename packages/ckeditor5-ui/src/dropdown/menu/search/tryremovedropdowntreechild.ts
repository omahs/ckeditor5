/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/tryremovedropdowntreechild
 */

import type { DropdownMenuViewsChildItem, DropdownMenusViewsTreeNode } from './createtreefromflattenmenuviews';

/**
 * If passed element has `children` property then passed `child` is removed.
 */
export function tryRemoveDropdownTreeChild(
	parent: DropdownMenusViewsTreeNode,
	child: DropdownMenuViewsChildItem
): DropdownMenusViewsTreeNode {
	switch ( parent.kind ) {
		case 'Item':
			/* NOP */
			break;

		case 'Menu':
		case 'Root':
			parent.children.splice( parent.children.indexOf( child ), 1 );
			break;

		default: {
			const unknownNode: never = parent;
			console.warn( 'Unknown node kind!', unknownNode );
		}
	}

	return parent;
}
