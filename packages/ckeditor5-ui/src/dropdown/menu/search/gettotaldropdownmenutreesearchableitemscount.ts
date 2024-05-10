/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/gettotaldropdownmenutreesearchableitemscount
 */

import { walkOverDropdownMenuViewsTreeItems } from './walkoverdropdownmenuviewstreeitems';

import type { DropdownMenusViewsTreeNode } from './createtreefromflattenmenuviews';

export function getTotalDropdownMenuTreeSearchableItemsCount( tree: DropdownMenusViewsTreeNode ): number {
	let totalItemsCount = 0;

	walkOverDropdownMenuViewsTreeItems(
		{
			Item: {
				enter: () => {
					totalItemsCount++;
				}
			}
		},
		tree
	);

	return totalItemsCount;
}
