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
 * Performs filtering on passed tree.
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
			Item: {
				enter: ( { parent, node } ) => {
					// Reject element from tree if not matches.
					if ( !filterFn( node ) ) {
						tryRemoveDropdownMenuTreeChild( parent, node );
					} else {
						node.found = true;
					}
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

type WithFoundAttribute = {
	found?: boolean;
};

export type DropdownMenusViewsFilteredFlatItem = DropdownMenuViewsTreeFlatItem<WithFoundAttribute>;

export type DropdownMenusViewsFilteredTreeNode = DropdownMenusViewsTreeNode<WithFoundAttribute>;

export type DropdownMenuSearchResult = {
	filteredTree: DropdownMenusViewsFilteredTreeNode;
	resultsCount: number;
	totalItemsCount: number;
};
