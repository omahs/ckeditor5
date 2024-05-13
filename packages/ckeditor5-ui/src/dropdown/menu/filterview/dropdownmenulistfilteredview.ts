/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/filterview/dropdownmenulistfilteredview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuRootFactoryDefinition } from '../definition/dropdownmenudefinitiontypings.js';
import type FilteredView from '../../../search/filteredview.js';

import { filterDropdownMenuTreeByRegExp } from '../search/filterdropdownmenutreebyregexp.js';

import View from '../../../view.js';
import DropdownMenuListFoundListView from './dropdownmenulistfoundlistview.js';
import DropdownMenuRootListView from '../dropdownmenurootlistview.js';

/**
 * TODO
 */
export default class DropdownMenuListFilteredView extends View implements FilteredView {
	/**
	 * TODO
	 */
	public menuView: DropdownMenuRootListView;

	/**
	 * TODO
	 */
	public foundListView: DropdownMenuListFoundListView | null = null;

	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale, definition: DropdownMenuRootFactoryDefinition ) {
		super( locale );

		this.menuView = new DropdownMenuRootListView( locale, definition );
		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu-filter'
				],
				tabindex: -1
			},

			children: [
				this.menuView
			]
		} );
	}

	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const { element } = this;
		const { filteredTree, resultsCount, totalItemsCount } = filterDropdownMenuTreeByRegExp( regExp, this.menuView.tree );

		element!.innerHTML = '';

		if ( this.foundListView ) {
			this.foundListView.destroy();
			this.foundListView = null;
		}

		if ( resultsCount !== totalItemsCount ) {
			this.foundListView = new DropdownMenuListFoundListView( this.locale!, regExp, filteredTree );
			this.foundListView.render();

			element!.appendChild( this.foundListView.element! );
		} else {
			element!.appendChild( this.menuView.element! );
		}

		return {
			resultsCount,
			totalItemsCount
		};
	}

	public focus(): void {
		const { menuView, foundListView } = this;

		if ( foundListView ) {
			foundListView.focus();
		} else {
			menuView.focus();
		}
	}
}
