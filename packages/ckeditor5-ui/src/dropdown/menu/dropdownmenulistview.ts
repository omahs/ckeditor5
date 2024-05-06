/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListView from '../../list/listview.js';

/**
 * TODO
 */
export class DropdownMenuListView extends ListView {
	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
	}
}
