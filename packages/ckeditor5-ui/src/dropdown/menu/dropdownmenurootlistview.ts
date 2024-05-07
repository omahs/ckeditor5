/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import { logWarning, type Locale, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';

import { isObject } from 'lodash-es';

import DropdownMenuListView from './dropdownmenulistview.js';
import type ComponentFactory from '../../componentfactory.js';
import type { DropdownMenuDefinition, NormalizedDropdownMenuConfigObject } from './typings.js';
import { DropdownMenuListItemButtonView } from './dropdownmenulistitembuttonview.js';
import { DropdownMenuView } from './dropdownmenuview.js';

import { processDropdownMenuConfig } from './utils.js';
import { DropdownMenuListItemView } from './dropdownmenulistitemview.js';
import ListSeparatorView from '../../list/listseparatorview.js';
import ListItemView from '../../list/listitemview.js';

const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ] as const;

/**
 * TODO
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * A list of {@link module:ui/menubar/menubarmenuview~DropdownMenuView} instances registered in the menu bar.
	 *
	 * @observable
	 */
	public menus: Array<DropdownMenuView> = [];

	/**
	 * Closes all menus in the bar.
	 */
	public close(): void {
		for ( const topLevelCategoryMenuView of this.items as unknown as Array<DropdownMenuView> ) {
			topLevelCategoryMenuView.isOpen = false;
		}
	}

	/**
	 * TODO
	 */
	public static ofConfig(
		{ locale, config, componentFactory }: DropdownMenuRootListFactoryAttrs
	): DropdownMenuRootListView {
		const rootList = new DropdownMenuRootListView( locale );
		const processedConfig = processDropdownMenuConfig( {
			normalizedConfig: config,
			componentFactory
		} );

		const topLevelCategoryMenuViews = processedConfig.items.map( menuDefinition => rootList._createMenu( {
			componentFactory,
			menuDefinition
		} ) );

		rootList.items.addMany( topLevelCategoryMenuViews );
		return rootList;
	}

	/**
	 * TODO
	 */
	private _createMenu( { componentFactory, menuDefinition, parentMenuView }: {
		componentFactory: ComponentFactory;
		menuDefinition: DropdownMenuDefinition;
		parentMenuView?: DropdownMenuView;
	} ) {
		const locale = this.locale!;
		const menuView = new DropdownMenuView( locale );

		this.registerMenu( menuView, parentMenuView );

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		// Defer the creation of the menu structure until it gets open. This is a performance optimization
		// that shortens the time needed to create the editor.
		menuView.once<ObservableChangeEvent<boolean>>( 'change:isOpen', () => {
			const listView = new DropdownMenuListView( locale );
			listView.ariaLabel = menuDefinition.label;
			menuView.panelView.children.add( listView );

			listView.items.addMany( this._createMenuItems( { menuDefinition, parentMenuView: menuView, componentFactory } ) );
		} );

		return menuView;
	}

	private _createMenuItems( { menuDefinition, parentMenuView, componentFactory }: {
		menuDefinition: DropdownMenuDefinition;
		componentFactory: ComponentFactory;
		parentMenuView: DropdownMenuView;
	} ): Array<DropdownMenuListItemView | ListSeparatorView> {
		const locale = this.locale!;
		const items = [];

		for ( const menuGroupDefinition of menuDefinition.groups ) {
			for ( const itemDefinition of menuGroupDefinition.items ) {
				const menuItemView = new DropdownMenuListItemView( locale, parentMenuView );

				if ( isObject( itemDefinition ) ) {
					menuItemView.children.add( this._createMenu( {
						componentFactory,
						menuDefinition: itemDefinition,
						parentMenuView
					} ) );
				} else {
					const componentView = this._createMenuItemContentFromFactory( {
						componentName: itemDefinition,
						componentFactory,
						parentMenuView
					} );

					if ( !componentView ) {
						continue;
					}

					menuItemView.children.add( componentView );
				}

				items.push( menuItemView );
			}

			// Separate groups with a separator.
			if ( menuGroupDefinition !== menuDefinition.groups[ menuDefinition.groups.length - 1 ] ) {
				items.push( new ListSeparatorView( locale ) );
			}
		}

		return items;
	}

	/**
	 * TODO
	 */
	private _createMenuItemContentFromFactory( { componentName, parentMenuView, componentFactory }: {
		componentName: string;
		componentFactory: ComponentFactory;
		parentMenuView: DropdownMenuView;
	} ): DropdownMenuView | DropdownMenuListItemButtonView | null {
		const componentView = componentFactory.create( componentName );

		if ( !(
			componentView instanceof DropdownMenuView ||
			componentView instanceof DropdownMenuListItemButtonView
		) ) {
			/**
			 * Adding unsupported components to the {@link module:ui/menubar/menubarview~MenuBarView} is not possible.
			 *
			 * A component should be either a {@link module:ui/menubar/menubarmenuview~DropdownMenuView} (sub-menu) or a
			 * {@link module:ui/menubar/menubarmenulistitembuttonview~DropdownMenuListItemButtonView} (button).
			 *
			 * @error menu-bar-component-unsupported
			 * @param componentName A name of the unsupported component used in the configuration.
			 * @param componentView An unsupported component view.
			 */
			logWarning( 'dropdown-menu-bar-component-unsupported', {
				componentName,
				componentView
			} );

			return null;
		}

		this._registerMenuTree( componentView, parentMenuView );

		// Close the whole menu bar when a component is executed.
		componentView.on( 'execute', () => {
			this.close();
		} );

		return componentView;
	}

	/**
	 * TODO
	 */
	private _registerMenuTree( componentView: DropdownMenuView | DropdownMenuListItemButtonView, parentMenuView: DropdownMenuView ) {
		if ( !( componentView instanceof DropdownMenuView ) ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return;
		}

		this.registerMenu( componentView, parentMenuView );

		const menuBarItemsList = componentView.panelView.children
			.filter( child => child instanceof DropdownMenuListView )[ 0 ] as DropdownMenuListView | undefined;

		if ( !menuBarItemsList ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return;
		}

		const nonSeparatorItems = menuBarItemsList.items.filter( item => item instanceof ListItemView ) as Array<ListItemView>;

		for ( const item of nonSeparatorItems ) {
			this._registerMenuTree(
				item.children.get( 0 ) as DropdownMenuView | DropdownMenuListItemButtonView,
				componentView
			);
		}
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

		this.menus.push( menuView );
	}
}

type DropdownMenuRootListFactoryAttrs = {
	locale: Locale;
	config: NormalizedDropdownMenuConfigObject;
	componentFactory: ComponentFactory;
};
