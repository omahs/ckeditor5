/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitembuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ButtonView from '../../button/buttonview.js';

import '../../../theme/components/dropdown/menu/dropdownmenulistitembutton.css';

/**
 * TODO
 */
export default class DropdownMenuListItemButtonView extends ButtonView {
	constructor( locale: Locale, label?: string ) {
		super( locale );

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false,
			role: 'menuitem',
			label
		} );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-dropdown-menu-bar__menu__item__button' ]
			}
		} );
	}
}
