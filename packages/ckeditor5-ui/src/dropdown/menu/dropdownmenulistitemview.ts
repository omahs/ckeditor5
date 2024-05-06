/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitemview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListItemView from '../../list/listitemview.js';
import type { DropdownMenuView } from './dropdownmenuview.js';

import '../../theme/components/menubar/DropdownMenulistitem.css';

/**
 * TODO
 */
export class DropdownMenuListItemView extends ListItemView {
	/**
	 * Creates an instance of the list item view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale, parentMenuView: DropdownMenuView ) {
		super( locale );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__item'
				]
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );

		this.delegate( 'mouseenter' ).to( parentMenuView );
	}
}
