/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import { last } from 'lodash-es';

import type DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuChangeIsOpenEvent } from './events.js';

import { isDropdownMenuDefinition } from './definition/definitionguards.js';
import type {
	DropdownMenuViewItemDefinition,
	DropdownMenuDefinition,
	DropdownMenuRootFactoryDefinition
} from './definition/definitiontypings.js';

import DropdownMenuView from './dropdownmenuview.js';
import { DropdownMenuListItemView } from './dropdownmenulistitemview.js';
import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';

import ListSeparatorView from '../../list/listseparatorview.js';
import ListItemView from '../../list/listitemview.js';
import DropdownMenuListView from './dropdownmenulistview.js';

import { createTreeFromFlattenDropdownMenusList, type DropdownMenuViewsRootTree } from './search/createtreefromflattendropdownmenuslist.js';
import { walkOverDropdownMenuTreeItems, type DropdownMenuViewsTreeWalkers } from './search/walkoverdropdownmenutreeitems.js';

const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ] as const;

/**
 * TODO
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * TODO
	 */
	private _menus: Array<DropdownMenuView> = [];

	/**
	 * Indicates whether any of top-level menus are open in the menu bar. To close
	 * the menu bar use the {@link #close} method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	constructor( locale: Locale, definition: DropdownMenuRootFactoryDefinition ) {
		super( locale );

		this.set( 'isOpen', false );
		this._setupIsOpenUpdater();
		this._createFromDefinition( definition );
	}

	public get menus(): Readonly<Array<DropdownMenuView>> {
		return [ ...this._menus ];
	}

	/**
	 * TODO
	 */
	public get tree(): Readonly<DropdownMenuViewsRootTree> {
		return createTreeFromFlattenDropdownMenusList( this._menus );
	}

	/**
	 * TODO
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Closes all menus in the bar.
	 */
	public close(): void {
		for ( const menuView of this._menus ) {
			menuView.isOpen = false;
		}
	}

	/**
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
	 * TODO
	 */
	private _createFromDefinition( { items }: DropdownMenuRootFactoryDefinition ) {
		const topLevelMenuViews = items.map( menuDefinition => {
			const listItem = new DropdownMenuListItemView( this.locale! );

			listItem.children.add(
				this._createMenuFromDefinition( {
					menuDefinition
				} )
			);

			return listItem;
		} );

		this.items.addMany( topLevelMenuViews );
	}

	/**
	 * TODO
	 */
	private _createMenuFromDefinition( { menuDefinition, parentMenuView }: {
		menuDefinition: DropdownMenuDefinition;
		parentMenuView?: DropdownMenuView;
	} ) {
		const locale = this.locale!;
		const menuView = new DropdownMenuView( locale );

		this.registerMenu( menuView, parentMenuView );

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		const listView = new DropdownMenuListView( locale );

		listView.ariaLabel = menuDefinition.label;
		listView.items.addMany(
			this._createMenuItemsFromDefinition( {
				menuDefinition,
				parentMenuView: menuView
			} )
		);

		menuView.panelView.children.add( listView );
		return menuView;
	}

	private _createMenuItemsFromDefinition( { menuDefinition, parentMenuView }: {
		menuDefinition: DropdownMenuDefinition;
		parentMenuView: DropdownMenuView;
	} ): Array<DropdownMenuListItemView | ListSeparatorView> {
		const { groups } = menuDefinition;
		const locale = this.locale!;
		const items = [];

		for ( const menuGroupDefinition of groups ) {
			for ( const itemDefinition of menuGroupDefinition.items ) {
				const menuItemView = new DropdownMenuListItemView( locale, parentMenuView );

				if ( isDropdownMenuDefinition( itemDefinition ) ) {
					menuItemView.children.add(
						this._createMenuFromDefinition( {
							menuDefinition: itemDefinition,
							parentMenuView
						} )
					);
				} else {
					const componentView = this._registerMenuTreeFromDefinition( itemDefinition, parentMenuView );

					if ( !componentView ) {
						continue;
					}

					menuItemView.children.add( componentView );
				}

				items.push( menuItemView );
			}

			// Separate groups with a separator.
			if ( menuGroupDefinition !== last( groups ) ) {
				items.push( new ListSeparatorView( locale ) );
			}
		}

		return items;
	}

	/**
	 * TODO
	 */
	private _registerMenuTreeFromDefinition( componentView: DropdownMenuViewItemDefinition, parentMenuView: DropdownMenuView ) {
		// Close the whole menu bar when a component is executed.
		componentView.on( 'execute', () => {
			this.close();
		} );

		if ( !( componentView instanceof DropdownMenuView ) ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return componentView;
		}

		this.registerMenu( componentView, parentMenuView );

		const menuBarItemsList = componentView.panelView.children
			.filter( child => child instanceof DropdownMenuListView )[ 0 ] as DropdownMenuListView | undefined;

		if ( !menuBarItemsList ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return componentView;
		}

		const nonSeparatorItems = menuBarItemsList.items.filter( item => item instanceof ListItemView ) as Array<ListItemView>;

		for ( const item of nonSeparatorItems ) {
			this._registerMenuTreeFromDefinition(
				item.children.get( 0 ) as DropdownMenuView | DropdownMenuListItemButtonView,
				componentView
			);
		}

		return componentView;
	}

	/**
	 * TODO
	 */
	public registerMenu( menuView: DropdownMenuView, parentMenuView: DropdownMenuView | null = null ): void {
		if ( parentMenuView ) {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView );
			menuView.parentMenuView = parentMenuView;
		} else {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( this, name => 'menu:' + name );
		}

		menuView._attachBehaviors();
		this._menus.push( menuView );
	}

	/**
	 * Manages the state of the {@link #isOpen} property of the menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents from unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of in which order), maintaining a stable `isOpen === true` in that situation.
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		// TODO: This is not the prettiest approach but at least it's simple.
		this.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = this._menus.some( menuView => menuView.isOpen );
				}, 0 );
			}
		} );
	}
}
