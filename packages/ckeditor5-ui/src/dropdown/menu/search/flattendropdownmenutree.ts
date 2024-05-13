/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuViewsTreeFlatItem, DropdownMenusViewsTreeNode } from './createtreefromflattendropdownmenuslist.js';
import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

/**
 * @module ui/dropdown/menu/search/flattendropdownmenutree
 */

export function flattenDropdownMenuTree<Extend>(
	tree: DropdownMenusViewsTreeNode<Extend>
): Array<DropdownMenusViewsTreeFlattenNode<Extend>> {
	const flattenNodes: Array<DropdownMenusViewsTreeFlattenNode<Extend>> = [];

	walkOverDropdownMenuTreeItems(
		{
			Item: ( { node, parents } ) => {
				flattenNodes.push(
					{
						parents,
						node
					}
				);
			}
		},
		tree
	);

	return flattenNodes;
}

type DropdownMenusViewsTreeFlattenNode<Extend = unknown> = {
	parents: NonEmptyArray<DropdownMenusViewsTreeNode<Extend>>;
	node: DropdownMenuViewsTreeFlatItem<Extend>;
};
