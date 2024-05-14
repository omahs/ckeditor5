/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';

import { createTreeFromFlattenDropdownMenusList } from '../../../../src/dropdown/menu/search/createtreefromflattendropdownmenuslist.js';
import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/search/walkoverdropdownmenutreeitems.js';

describe( 'createTreeFromFlattenDropdownMenusList', () => {
	let locale, menuRootList;

	beforeEach( () => {
		locale = { t() {} };
		menuRootList = new DropdownMenuRootListView( locale );
	} );

	it( 'should handle empty menus array', () => {
		const result = createTreeFromFlattenDropdownMenusList( [] );

		expect( result ).deep.equal( {
			kind: 'Root',
			children: []
		} );
	} );

	it( 'should create flatten list of menus', () => {
		const menu1 = {
			label: 'Menu 1',
			groups: [
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'Foo' ),
						new DropdownMenuListItemButtonView( locale, 'Bar' )
					]
				},
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'Buz' )
					]
				}
			]
		};

		const menu2 = {
			label: 'Menu 2',
			groups: [
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'A' ),
						new DropdownMenuListItemButtonView( locale, 'B' )
					]
				}
			]
		};

		menuRootList.definition.appendMenus( {
			items: [ menu1, menu2 ]
		} );

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.menus );

		expect( tree ).to.deep.equal(
			{
				kind: 'Root',
				children: [
					mapMenuViewToMenuItemByLabel(
						'Menu 1', tree,
						[
							...menu1.groups[ 0 ].items,
							...menu1.groups[ 1 ].items
						].map( mapButtonViewToMenuItem )
					),

					mapMenuViewToMenuItemByLabel( 'Menu 2', tree, menu2.groups[ 0 ].items.map( mapButtonViewToMenuItem ) )
				]
			}
		);
	} );

	it( 'should reuse custom empty menu instance if provided', () => {
		const menuInstance = new DropdownMenuView( locale, 'Hello World' );

		menuRootList.definition.appendMenus( {
			items: [
				{
					label: 'Menu Root',
					groups: [
						{
							items: [ menuInstance ]
						}
					]
				}
			]
		} );

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.menus );

		expect( tree ).to.deep.equal(
			{
				kind: 'Root',
				children: [
					mapMenuViewToMenuItemByLabel( 'Menu Root', tree, [
						mapMenuViewToMenuItem( menuInstance )
					] )
				]
			}
		);
	} );

	it( 'should reuse custom menu instance with custom entries if provided', () => {
		const menuInstance = new DropdownMenuView( locale, 'Hello World' );
		const nestedEntries = [
			new DropdownMenuListItemButtonView( locale, 'Hello' ),
			new DropdownMenuListItemButtonView( locale, 'World' )
		];

		menuRootList.definition.appendMenus( {
			items: [
				{
					label: 'Menu Root',
					groups: [
						{
							items: [ menuInstance ]
						}
					]
				}
			]
		} );

		menuRootList.definition.appendMenuItems(
			[
				{
					items: nestedEntries
				}
			],
			menuInstance
		);

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.menus );

		expect( tree ).to.deep.equal(
			{
				kind: 'Root',
				children: [
					mapMenuViewToMenuItemByLabel( 'Menu Root', tree, [
						mapMenuViewToMenuItem( menuInstance, nestedEntries.map( mapButtonViewToMenuItem ) )
					] )
				]
			}
		);
	} );

	function mapMenuViewToMenuItem( menu, children = [] ) {
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

	function mapMenuViewToMenuItemByLabel( label, tree, children = [] ) {
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

	function mapButtonViewToMenuItem( button ) {
		return {
			kind: 'Item',
			item: button,
			search: {
				raw: button.label,
				text: button.label.toLowerCase()
			}
		};
	}

	function findMenuTreeViewItemByLabel( label, tree ) {
		return findAllMenusTreeNodesByLabel( label, tree )[ 0 ].menu;
	}

	function findAllMenusTreeNodesByLabel( label, tree ) {
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
} );
