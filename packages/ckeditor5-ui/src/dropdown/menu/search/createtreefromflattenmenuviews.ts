/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { DropdownMenuFlatItem } from '../typings.js';
import type DropdownMenuView from '../dropdownmenuview.js';
import type DropdownMenuListView from '../dropdownmenulistview.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuFlatItemView, isDropdownMenuView } from '../guards.js';
import { mapFilter } from '@ckeditor/ckeditor5-utils';

/**
 * @module ui/dropdown/menu/utils/createtreefromflattenmenuviews
 */

export function createTreeFromFlattenMenuViews( menus: Array<DropdownMenuView> ): DropdownMenusViewsTree {
	const menusTreeMap = menus.reduce<Map<DropdownMenuView, DropdownMenusViewsTree>>(
		( acc, menu ) => {
			acc.set( menu, {
				menu,
				children: [],
				root: false,
				search: {
					text: menu.buttonView.label!
				}
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
					item: firstContentChild,
					search: {
						text: firstContentChild.label!
					}
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
	const rootTree: DropdownMenusViewsTree = {
		root: true,
		children: []
	};

	rootTree.children = Array.from(
		mapFilter( ( _, tree ) => !tree.root && !tree.menu.parentMenuView, menusTreeMap ).values()
	);

	return rootTree;
}

type TreeAutocompleteSearchMetaData = {
	text: string;
};

type WithTreeSearchMetadata<O> = O & {
	search: TreeAutocompleteSearchMetaData;
};

type DropdownMenusViewsTreeFlatItem = WithTreeSearchMetadata<{
	item: DropdownMenuFlatItem;
}>;

type DropdownMenuViewsTreeChildren = Array<DropdownMenusViewsTreeFlatItem | DropdownMenusViewsTree>;

type DropdownMenusViewsTree =
	| WithTreeSearchMetadata<{
		root: false;
		menu: DropdownMenuView;
		children: DropdownMenuViewsTreeChildren;
	}>
	| {
		root: true;
		children: DropdownMenuViewsTreeChildren;
	};
