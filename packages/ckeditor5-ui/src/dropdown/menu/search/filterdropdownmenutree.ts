/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/searchdropdownmenuslist
 */

import type { DeepReadonly } from '@ckeditor/ckeditor5-core';
import type {
	DropdownMenuViewsRootTree,
	DropdownMenuViewsTreeFlatItem,
	DropdownMenusViewsTreeNode,
	ExcludeDropdownMenuViewTreeNodeByKind
} from './createtreefromflattendropdownmenuslist.js';

import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';
import { tryRemoveDropdownMenuTreeChild } from './tryremovedropdownmenutreechild.js';
import { getTotalDropdownMenuTreeSearchableItemsCount } from './gettotaldropdownmenutreesearchableitemscount.js';
import { shallowCloneDropdownMenuTree } from './shallowclonedropdownmenutree.js';

/**
 * Filters the dropdown menu tree based on the provided filter function.
 * Returns a copy of the filtered tree and does not modify the original tree.
 *
 * @param filterFn The filter function to apply to each node in the tree.
 * @param tree The dropdown menu tree to filter.
 * @returns The filtered tree and the total number of searchable items in the tree.
 */
export function filterDropdownMenuTree(
	filterFn: ( node: ExcludeDropdownMenuViewTreeNodeByKind<'Root'> ) => boolean,
	tree: DeepReadonly<DropdownMenuViewsRootTree>
): DropdownMenuSearchResult {
	const clonedTree: DropdownMenusViewsFilteredTreeNode = shallowCloneDropdownMenuTree( tree );
	const totalItemsCount = getTotalDropdownMenuTreeSearchableItemsCount( clonedTree );

	walkOverDropdownMenuTreeItems(
		{
			Menu: {
				enter: ( { node } ) => {
					if ( filterFn( node ) ) {
						node.found = true;
						return false;
					}
				},

				leave: ( { parent, node } ) => {
					// If there is no children left erase current menu from parent entry.
					if ( !node.children.length ) {
						tryRemoveDropdownMenuTreeChild( parent, node );
					}
				}
			},
			Item: ( { parent, node } ) => {
				// Reject element from tree if not matches.
				if ( !filterFn( node ) ) {
					tryRemoveDropdownMenuTreeChild( parent, node );
				} else {
					node.found = true;
				}
			}
		},
		clonedTree
	);

	return {
		resultsCount: getTotalDropdownMenuTreeSearchableItemsCount( clonedTree ),
		filteredTree: clonedTree,
		totalItemsCount
	};
}

/**
 * Represents a type used to mark which tree items have been found.
 */
type WithFoundAttribute = {
	found?: boolean;
};

/**
 * Represents a filtered flat item in the dropdown menu views.
 * It is a type that extends `DropdownMenuViewsTreeFlatItem` and adds the `WithFoundAttribute` attribute.
 */
export type DropdownMenusViewsFilteredFlatItem = DropdownMenuViewsTreeFlatItem<WithFoundAttribute>;

/**
 * Represents a filtered tree node in a dropdown menu view.
 */
export type DropdownMenusViewsFilteredTreeNode = DropdownMenusViewsTreeNode<WithFoundAttribute>;

/**
 * Represents the result of a dropdown menu search.
 */
export type DropdownMenuSearchResult = {

	/**
	 * The filtered tree containing the search results.
	 */
	filteredTree: DropdownMenusViewsFilteredTreeNode;

	/**
	 * The number of search results.
	 */
	resultsCount: number;

	/**
	 * The total number of items in the dropdown menu.
	 */
	totalItemsCount: number;
};
