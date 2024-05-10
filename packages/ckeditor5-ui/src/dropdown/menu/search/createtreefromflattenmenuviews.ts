/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/createtreefromflattenmenuviews
 */

import type { DropdownMenuFlatItem } from '../typings.js';
import type DropdownMenuView from '../dropdownmenuview.js';
import type DropdownMenuListView from '../dropdownmenulistview.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuFlatItemView, isDropdownMenuView } from '../guards.js';
import { mapFilter } from '@ckeditor/ckeditor5-utils';
import { createTextSearchMetadata, type WithTreeSearchMetadata } from './dropdownmenutreesearchmetadata.js';

/**
 * Constructs tree based on currently rendered dropdown menu views. It is not based on factory
 * definition, so constructed tree includes all recent modifications of menus such as addition or removal menu items.
 */
export function createTreeFromFlattenMenuViews( menus: Array<DropdownMenuView> ): DropdownMenuViewsRootTree {
	const menusTreeMap = menus.reduce<Map<DropdownMenuView, DropdownMenuViewsNestedTree>>(
		( acc, menu ) => {
			acc.set( menu, {
				menu,
				kind: 'Menu',
				children: [],
				search: createTextSearchMetadata( menu.buttonView.label )
			} );

			return acc;
		},
		new Map()
	);

	// Let's fill whole menu tree map with children entries.
	for ( const menu of menus ) {
		const { children } = menusTreeMap.get( menu )!;
		const menuPanelView = menu.panelView.children!.first as DropdownMenuListView;

		for ( const item of menuPanelView.items ) {
			if ( !( item instanceof DropdownMenuListItemView ) ) {
				continue;
			}

			const firstContentChild = item.children.first;

			if ( isDropdownMenuFlatItemView( firstContentChild ) ) {
				children.push( {
					kind: 'Item',
					item: firstContentChild,
					search: createTextSearchMetadata( firstContentChild.label )
				} );
			} else if ( isDropdownMenuView( firstContentChild ) ) {
				const maybeTreeMenu = menusTreeMap.get( firstContentChild );

				if ( maybeTreeMenu ) {
					children.push( maybeTreeMenu );
				}
			}
		}
	}

	// Pick only top level menus from map and assign them to root entry.
	const rootTree: DropdownMenuViewsRootTree = {
		kind: 'Root',
		children: []
	};

	rootTree.children = Array.from(
		mapFilter( ( _, tree ) => !tree.menu.parentMenuView, menusTreeMap ).values()
	);

	return rootTree;
}

type WithTreeEntryKind<K extends string> = {
	kind: K;
};

type DropdownMenuViewsTreeFlatItem =
	& WithTreeEntryKind<'Item'>
	& WithTreeSearchMetadata
	& {
		item: DropdownMenuFlatItem;
	};

type DropdownMenuViewsNestedTree =
	& WithTreeEntryKind<'Menu'>
	& WithTreeSearchMetadata
	& {
		menu: DropdownMenuView;
		children: Array<DropdownMenuViewsChildItem>;
	};

type DropdownMenuViewsRootTree =
	& WithTreeEntryKind<'Root'>
	& {
		children: Array<DropdownMenuViewsChildItem>;
	};

export type DropdownMenuViewsChildItem =
	| DropdownMenuViewsTreeFlatItem
	| DropdownMenuViewsNestedTree;

export type DropdownMenusViewsTreeNode =
	| DropdownMenuViewsChildItem
	| DropdownMenuViewsNestedTree
	| DropdownMenuViewsRootTree;

export type DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNode[ 'kind' ];

export type ExtractDropdownMenuViewTreeNodeByKind<K extends DropdownMenusViewsTreeNodeKind> =
	Extract<DropdownMenusViewsTreeNode, { kind: K }>;
