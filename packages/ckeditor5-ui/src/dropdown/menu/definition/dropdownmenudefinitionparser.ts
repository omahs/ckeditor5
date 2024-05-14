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
	DropdownMenuGroupDefinition,
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
 * Parser for dropdown menu definitions.
 */
export class DropdownMenuDefinitionParser {
	/**
	 * The root list view of the dropdown menu.
	 */
	private readonly _view: DropdownMenuRootListView;

	/**
	 * Creates an instance of DropdownMenuDefinitionParser.
	 *
	 * @param view The root list view of the dropdown menu.
	 */
	constructor( view: DropdownMenuRootListView ) {
		this._view = view;
	}

	/**
	 * Appends menus to the dropdown menu root view based on the provided definition.
	 *
	 * @param definition The dropdown menu factory definition.
	 */
	public appendMenus( { items }: DropdownMenuRootFactoryDefinition ): void {
		const topLevelMenuViews = items.map( menuDefinition => {
			const listItem = new DropdownMenuListItemView( this._view.locale! );

			listItem.children.add(
				this._registerMenuFromDefinition( menuDefinition )
			);

			return listItem;
		} );

		this._view.items.addMany( topLevelMenuViews );
	}

	/**
	 * Appends menu items to the target parent menu view.
	 *
	 * @param groups An array of dropdown menu group definitions.
	 * @param targetParentMenuView The target parent menu view to append the menu items to.
	 */
	public appendMenuItems(
		groups: Array<DropdownMenuGroupDefinition>,
		targetParentMenuView: DropdownMenuView
	): void {
		const { _view } = this;

		const locale = _view.locale!;
		const items = [];

		for ( const menuGroupDefinition of groups ) {
			for ( const itemDefinition of menuGroupDefinition.items ) {
				const menuItemView = new DropdownMenuListItemView( locale, targetParentMenuView );

				if ( isDropdownMenuDefinition( itemDefinition ) ) {
					menuItemView.children.add(
						this._registerMenuFromDefinition( itemDefinition, targetParentMenuView )
					);
				} else {
					const componentView = this._registerMenuTreeFromDefinition( itemDefinition, targetParentMenuView );

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

		if ( items.length ) {
			targetParentMenuView.listView.items.addMany( items );
		}
	}

	/**
	 * Creates a menu view from the given menu definition.
	 *
	 * @param menuDefinition The dropdown menu definition.
	 * @param parentMenuView The parent menu view, if any.
	 * @returns The created menu view.
	 */
	private _registerMenuFromDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView?: DropdownMenuView
	) {
		const { _view } = this;
		const locale = _view.locale!;

		const menuView = new DropdownMenuView( locale, menuDefinition.label );

		this.appendMenuItems( menuDefinition.groups, menuView );
		_view.registerMenu( menuView, parentMenuView );

		return menuView;
	}

	/**
	 * Registers a menu tree from the given component view definition.
	 *
	 * @param componentView The component view definition.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered component view.
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
