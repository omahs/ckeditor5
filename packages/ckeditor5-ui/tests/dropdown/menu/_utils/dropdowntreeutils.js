/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/search/walkoverdropdownmenutreeitems.js';

export function createRootTree( children = [] ) {
	return {
		kind: 'Root',
		children
	};
}

export function mapMenuViewToMenuItem( menu, children = [] ) {
	return {
		kind: 'Menu',
		menu,
		search: {
			raw: menu.buttonView.label || '',
			text: ( menu.buttonView.label || '' ).toLowerCase()
		},
		children
	};
}

export function mapMenuViewToMenuItemByLabel( label, tree, children = [] ) {
	return {
		kind: 'Menu',
		menu: findMenuTreeViewItemByLabel( label, tree ),
		search: {
			raw: label,
			text: label.toLowerCase()
		},
		children
	};
}

export function mapButtonViewToMenuItem( button ) {
	return {
		kind: 'Item',
		item: button,
		search: {
			raw: button.label,
			text: button.label.toLowerCase()
		}
	};
}

export function findMenuTreeViewItemByLabel( label, tree ) {
	return findAllMenusTreeNodesByLabel( label, tree )[ 0 ].menu;
}

export function findAllMenusTreeNodesByLabel( label, tree ) {
	const foundMenus = [];

	walkOverDropdownMenuTreeItems(
		{
			Menu: ( { node } ) => {
				if ( node.search.raw === label ) {
					foundMenus.push( node );
				}
			}
		},
		tree
	);

	return foundMenus;
}

export function markAsFound( item ) {
	return {
		...item,
		found: true
	};
}
