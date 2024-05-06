/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitemfiledialogbuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import FileDialogButtonView from '../../button/filedialogbuttonview.js';

import '../../theme/components/menubar/DropdownMenulistitembutton.css';

/**
 * TODO
 */
export class DropdownMenuListItemFileDialogButtonView extends FileDialogButtonView {
	/**
	 * Creates an instance of the menu bar list button view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false,
			role: 'menuitem'
		} );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-menu-bar__menu__item__button' ]
			}
		} );
	}
}
