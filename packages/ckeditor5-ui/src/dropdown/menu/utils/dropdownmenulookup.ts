/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { DropdownMenuButtonLikeItem } from '../typings.js';
import type { DropdownMenuView } from '../dropdownmenuview.js';
import type { DropdownMenuPanelView } from '../dropdownmenupanelview.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuButtonLikeViewItem } from '../guards.js';

/**
 * @module ui/dropdown/menu/utils/dropdownmenulookup
 */

export function constructTreeFromFlattenMenuViews( menus: Array<DropdownMenuView> ): DropdownMenusViewsItemsTree {
	const menusTreeMap = menus.reduce<Map<DropdownMenuView, DropdownMenusViewsItemsTree>>(
		( acc, menu ) => {
			acc.set( menu, {
				parent: menu.parentMenuView,
				children: []
			} );

			return acc;
		},
		new Map()
	);

	for ( const menu of menus ) {
		const menuTreeEntry = menusTreeMap.get( menu )!;

		console.info( menu.panelView );

		if ( !menu.panelView ) {
			continue;
		}

		const menuPanelView = menu.panelView.children.first! as DropdownMenuPanelView;

		for ( const item of menuPanelView.children ) {
			if ( !( item instanceof DropdownMenuListItemView ) ) {
				console.warn( 'Incorrect menu entry item!', item );
				continue;
			}

			if ( isDropdownMenuButtonLikeViewItem( item ) ) {
				console.info( item );

				menuTreeEntry.children.push( item );
			}
		}
	}

	console.info( [ ...menusTreeMap.entries() ] );

	return {
		parent: null,
		children: []
	};
}

type DropdownMenusViewsItemsTree = {
	parent: DropdownMenuView | null;
	children: Array<DropdownMenuButtonLikeItem | DropdownMenusViewsItemsTree>;
};
