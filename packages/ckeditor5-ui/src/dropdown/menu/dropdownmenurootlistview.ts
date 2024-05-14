/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuChangeIsOpenEvent } from './events.js';
import type { DropdownMenuRootFactoryDefinition } from './definition/dropdownmenudefinitiontypings.js';
import type DropdownMenuView from './dropdownmenuview.js';

import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';
import DropdownMenuListView from './dropdownmenulistview.js';

import {
	createTreeFromFlattenDropdownMenusList,
	type DropdownMenuViewsRootTree
} from './search/createtreefromflattendropdownmenuslist.js';

import { DropdownMenuDefinitionParser } from './definition/dropdownmenudefinitionparser.js';
import {
	walkOverDropdownMenuTreeItems,
	type DropdownMenuViewsTreeWalkers
} from './search/walkoverdropdownmenutreeitems.js';

const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ] as const;

/**
 * Represents the root list view of a dropdown menu.
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * Array of top-level menus in the dropdown menu.
	 */
	private _menus: Array<DropdownMenuView> = [];

	/**
	 * Indicates whether any of the top-level menus are open in the menu bar. To close
	 * the menu bar, use the `close` method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * Creates a new instance of DropdownMenuRootListView.
	 *
	 * @param locale - The locale of the dropdown menu.
	 * @param definition - The definition of the dropdown menu.
	 */
	constructor( locale: Locale, definition: DropdownMenuRootFactoryDefinition ) {
		super( locale );

		this.set( 'isOpen', false );

		this._setupIsOpenUpdater();
		this.definition.appendMenus( definition );
	}

	/**
	 * Gets the definition parser for the dropdown menu.
	 *
	 * @returns The definition parser.
	 */
	public get definition(): DropdownMenuDefinitionParser {
		return new DropdownMenuDefinitionParser( this );
	}

	/**
	 * Gets the array of top-level menus in the dropdown menu.
	 *
	 * @returns The array of top-level menus.
	 */
	public get menus(): Readonly<Array<DropdownMenuView>> {
		return [ ...this._menus ];
	}

	/**
	 * Gets the tree representation of the dropdown menu views.
	 *
	 * @returns The tree representation of the dropdown menu views.
	 */
	public get tree(): Readonly<DropdownMenuViewsRootTree> {
		return createTreeFromFlattenDropdownMenusList( this._menus );
	}

	/**
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers - The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Closes all menus in the dropdown menu bar.
	 */
	public close(): void {
		for ( const menuView of this._menus ) {
			menuView.isOpen = false;
		}
	}

	/**
	 * Renders the dropdown menu.
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		DropdownRootMenuBehaviors.toggleMenusAndFocusItemsOnHover( this );
		DropdownRootMenuBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
		DropdownRootMenuBehaviors.closeOnClickOutside( this );
		DropdownRootMenuBehaviors.closeWhenOutsideElementFocused( this );
	}

	/**
	 * Registers a menu in the dropdown menu.
	 *
	 * @param menuView - The menu view to register.
	 * @param parentMenuView - The parent menu view, if any.
	 */
	public registerMenu( menuView: DropdownMenuView, parentMenuView: DropdownMenuView | null = null ): void {
		if ( parentMenuView ) {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView );
			menuView.parentMenuView = parentMenuView;
		} else {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( this, name => `menu:${ name }` );
		}

		menuView._attachBehaviors();
		menuView.on( 'execute', () => {
			// Close the whole menu bar when a component is executed.
			this.close();
		} );

		this._menus.push( menuView );
	}

	/**
	 * Manages the state of the `isOpen` property of the dropdown menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of the order), maintaining a stable `isOpen === true` in that situation.
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		this.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = this._menus.some( ( { isOpen } ) => isOpen );
				}, 0 );
			}
		} );
	}
}
