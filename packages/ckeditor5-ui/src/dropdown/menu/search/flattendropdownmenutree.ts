/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/flattendropdownmenutree
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuViewsTreeFlatItem, DropdownMenusViewsTreeNode } from './createtreefromflattendropdownmenuslist.js';
import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

/**
 * Flattens a dropdown menu tree into an array of flattened nodes.
 *
 * @template Extend The type of additional properties that can be attached to each node.
 * @param tree The dropdown menu tree to flatten.
 * @returns An array of flattened nodes.
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

/**
 * Represents a node in the flattened tree structure of dropdown menus views.
 */
type DropdownMenusViewsTreeFlattenNode<Extend = unknown> = {
	parents: NonEmptyArray<DropdownMenusViewsTreeNode<Extend>>;
	node: DropdownMenuViewsTreeFlatItem<Extend>;
};
