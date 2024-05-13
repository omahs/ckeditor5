/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/gettotaldropdownmenutreesearchableitemscount
 */

import type { DropdownMenusViewsTreeNode } from './createtreefromflattendropdownmenuslist.js';
import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

export function getTotalDropdownMenuTreeSearchableItemsCount<Extend>( tree: DropdownMenusViewsTreeNode<Extend> ): number {
	let totalItemsCount = 0;

	walkOverDropdownMenuTreeItems<Extend>(
		{
			Item: () => {
				totalItemsCount++;
			}
		},
		tree
	);

	return totalItemsCount;
}
