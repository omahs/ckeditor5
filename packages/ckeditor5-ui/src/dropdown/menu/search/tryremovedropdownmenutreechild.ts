/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/tryremovedropdownmenutreechild
 */

import type { DropdownMenuViewsTreeChildItem, DropdownMenusViewsTreeNode } from './createtreefromflattendropdownmenuslist.js';

/**
 * If passed element has `children` property then passed `child` is removed.
 */
export function tryRemoveDropdownMenuTreeChild<P extends DropdownMenusViewsTreeNode>(
	parent: P,
	child: DropdownMenuViewsTreeChildItem
): P {
	switch ( parent.kind ) {
		case 'Item':
			/* NOP */
			break;

		case 'Menu':
		case 'Root': {
			const index = parent.children.indexOf( child );

			if ( index !== -1 ) {
				parent.children.splice( index, 1 );
			}
		} break;

		default: {
			const unknownNode: never = parent;
			console.warn( 'Unknown node kind!', unknownNode );
		}
	}

	return parent;
}
