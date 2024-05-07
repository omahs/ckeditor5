/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type FilteredView from '../../search/filteredview.js';

import ListView from '../../list/listview.js';

/**
 * TODO
 */
export default class DropdownMenuListView extends ListView implements FilteredView {
	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
	}

	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number; } {
		console.info( regExp, [ ...this.items ] );

		return {
			resultsCount: this.items.length,
			totalItemsCount: this.items.length
		};
	}
}
