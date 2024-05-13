/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitionparser
 */
import { last } from 'lodash-es';

import type DropdownMenuListItemButtonView from '../dropdownmenulistitembuttonview.js';
import type DropdownMenuRootListView from '../dropdownmenurootlistview.js';
import type {
	DropdownMenuDefinition,
	DropdownMenuRootFactoryDefinition,
	DropdownMenuViewItemDefinition
} from './dropdownmenudefinitiontypings.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuDefinition } from './dropdownmenudefinitionguards.js';

import DropdownMenuListView from '../dropdownmenulistview.js';
import DropdownMenuView from '../dropdownmenuview.js';
import ListSeparatorView from '../../../list/listseparatorview.js';
import ListItemView from '../../../list/listitemview.js';

/**
 * TODO
 */
export class DropdownMenuDefinitionParser {
	private readonly _view: DropdownMenuRootListView;

	constructor( view: DropdownMenuRootListView ) {
		this._view = view;
	}

	/**
	 * TODO
	 */
	public appendMenus( { items }: DropdownMenuRootFactoryDefinition ): void {
		const topLevelMenuViews = items.map( menuDefinition => {
			const listItem = new DropdownMenuListItemView( this._view.locale! );

			listItem.children.add(
				this._createMenuFromDefinition( menuDefinition )
			);

			return listItem;
		} );

		this._view.items.addMany( topLevelMenuViews );
	}

	/**
	 * TODO
	 */
	private _createMenuFromDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView?: DropdownMenuView
	) {
		const { _view } = this;

		const locale = _view.locale!;
		const menuView = new DropdownMenuView( locale );

		_view.registerMenu( menuView, parentMenuView );

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		const listView = new DropdownMenuListView( locale );

		listView.ariaLabel = menuDefinition.label;
		listView.items.addMany(
			this._createMenuItemsFromDefinition( menuDefinition, menuView )
		);

		menuView.panelView.children.add( listView );
		return menuView;
	}

	/**
	 * TODO
	 */
	private _createMenuItemsFromDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView: DropdownMenuView
	): Array<DropdownMenuListItemView | ListSeparatorView> {
		const { _view } = this;
		const { groups } = menuDefinition;

		const locale = _view.locale!;
		const items = [];

		for ( const menuGroupDefinition of groups ) {
			for ( const itemDefinition of menuGroupDefinition.items ) {
				const menuItemView = new DropdownMenuListItemView( locale, parentMenuView );

				if ( isDropdownMenuDefinition( itemDefinition ) ) {
					menuItemView.children.add(
						this._createMenuFromDefinition( itemDefinition, parentMenuView )
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
	private _registerMenuTreeFromDefinition(
		componentView: DropdownMenuViewItemDefinition,
		parentMenuView: DropdownMenuView
	) {
		const { _view } = this;

		if ( !( componentView instanceof DropdownMenuView ) ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return componentView;
		}

		_view.registerMenu( componentView, parentMenuView );

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
}
