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
import { tryRemoveDropdownTreeChild } from './tryremovedropdowntreechild';

export function searchDropdownMenuTree(
	searchFn: DropdownMenuSearchCallback,
	menus: Array<DropdownMenuView>
): DropdownMenusViewsTreeNode {
	const workingTree = createTreeFromFlattenMenuViews( menus );

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
						tryRemoveDropdownTreeChild( parent, node );
					}
				}
			},
			Item: {
				enter: ( { parent, node } ) => {
					// Reject element from tree if not matches.
					if ( !searchFn( node.search ) ) {
						tryRemoveDropdownTreeChild( parent, node );
					}
				}
			}
		},
		workingTree
	);

	return workingTree;
}

export const searchDropdownMenuTreeByRegExp = (
	regExp: RegExp,
	menus: Array<DropdownMenuView>
): DropdownMenusViewsTreeNode =>
	searchDropdownMenuTree(
		( { text } ) => !!text && regExp.test( text ),
		menus
	);

type DropdownMenuSearchCallback = ( search: TreeSearchMetadata ) => boolean;
