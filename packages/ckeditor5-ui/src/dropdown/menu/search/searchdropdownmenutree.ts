/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/searchdropdowntreemenu
 */

import { walkOverDropdownMenuViewsTreeItems } from './walkoverdropdownmenuviewstreeitems';

import type DropdownMenuView from '../dropdownmenuview';
import type { TreeSearchMetadata } from './dropdownmenutreesearchmetadata';

import { createTreeFromFlattenMenuViews, type DropdownMenusViewsTreeNode } from './createtreefromflattenmenuviews';
import { tryRemoveDropdownMenuTreeChild } from './tryremovedropdownmenutreechild';
import { getTotalDropdownMenuTreeSearchableItemsCount } from './gettotaldropdownmenutreesearchableitemscount';

export function searchDropdownMenuTree(
	searchFn: DropdownMenuSearchCallback,
	menus: Array<DropdownMenuView>
): DropdownMenuSearchResult {
	const filteredTree = createTreeFromFlattenMenuViews( menus );
	const totalItemsCount = getTotalDropdownMenuTreeSearchableItemsCount( filteredTree );

	walkOverDropdownMenuViewsTreeItems(
		{
			Menu: {
				enter: ( { node } ) => {
					// If phrase matches group name - return whole group and abort further search.
					if ( searchFn( node.search ) ) {
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
					if ( !searchFn( node.search ) ) {
						tryRemoveDropdownMenuTreeChild( parent, node );
					}
				}
			}
		},
		filteredTree
	);

	return {
		resultsCount: getTotalDropdownMenuTreeSearchableItemsCount( filteredTree ),
		filteredTree,
		totalItemsCount
	};
}

export const searchDropdownMenuTreeByRegExp = (
	regExp: RegExp | null,
	menus: Array<DropdownMenuView>
): DropdownMenuSearchResult =>
	searchDropdownMenuTree(
		( { text } ) => {
			// If no regExp provided treat every item as matching.
			if ( !regExp ) {
				return true;
			}

			return !!( text || '' ).match( regExp );
		},
		menus
	);

type DropdownMenuSearchCallback = ( search: TreeSearchMetadata ) => boolean;

type DropdownMenuSearchResult = {
	filteredTree: DropdownMenusViewsTreeNode;
	resultsCount: number;
	totalItemsCount: number;
};
