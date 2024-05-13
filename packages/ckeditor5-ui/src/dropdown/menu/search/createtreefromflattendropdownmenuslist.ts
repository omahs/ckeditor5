/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/createtreefromflattendropdownmenuslist
 */

import { mapFilter } from '@ckeditor/ckeditor5-utils';

import type { Increment } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuFlatItem } from '../typings.js';
import type DropdownMenuView from '../dropdownmenuview.js';
import type DropdownMenuListView from '../dropdownmenulistview.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuFlatItemView, isDropdownMenuView } from '../guards.js';
import { createTextSearchMetadata, type WithTreeSearchMetadata } from './dropdownmenutreesearchmetadata.js';

/**
 * Constructs tree based on currently rendered dropdown menu views. It is not based on factory
 * definition, so constructed tree includes all recent modifications of menus such as addition or removal menu items.
 */
export function createTreeFromFlattenDropdownMenusList( menus: Array<DropdownMenuView> ): DropdownMenuViewsRootTree {
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

type MaxDropdownTreeMenuDepth = 6;

/**
 * Non-menu entry of menu such like Button or Checkbox.
 */
export type DropdownMenuViewsTreeFlatItem<Extend = unknown> =
	& Extend
	& WithTreeEntryKind<'Item'>
	& WithTreeSearchMetadata
	& {
		item: DropdownMenuFlatItem;
	};

/**
 * Menu entry of menu that holds flat items.
 */
type DropdownMenuViewsNestedTree<Extend = unknown, Level extends number = 0> =
	& Extend
	& WithTreeEntryKind<'Menu'>
	& WithTreeSearchMetadata
	& {
		menu: DropdownMenuView;
		children: MaxDropdownTreeMenuDepth extends Level ? never : Array<DropdownMenuViewsChildItem<Extend, Increment<Level>>>;
	};

export type DropdownMenuViewsChildItem<Extend = unknown, Level extends number = 0> =
	| DropdownMenuViewsTreeFlatItem<Extend>
	| DropdownMenuViewsNestedTree<Extend, Level>;

/**
 * Root menu entry that holds flat items or menu items.
 */
export type DropdownMenuViewsRootTree<Extend = unknown> =
	& WithTreeEntryKind<'Root'>
	& {
		children: Array<DropdownMenuViewsChildItem<Extend>>;
	};

/**
 * All possible tree node types.
 */
export type DropdownMenusViewsTreeNode<Extend = unknown, Level extends number = 0> =
	| DropdownMenuViewsChildItem<Extend, Level>
	| DropdownMenuViewsRootTree<Extend>;

export type DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNode[ 'kind' ];

export type ExtractDropdownMenuViewTreeNodeByKind<K extends DropdownMenusViewsTreeNodeKind, Extend = unknown> =
	Extract<DropdownMenusViewsTreeNode<Extend>, { kind: K }>;

export type ExcludeDropdownMenuViewTreeNodeByKind<K extends DropdownMenusViewsTreeNodeKind, Extend = unknown> =
	Exclude<DropdownMenusViewsTreeNode<Extend>, { kind: K }>;
