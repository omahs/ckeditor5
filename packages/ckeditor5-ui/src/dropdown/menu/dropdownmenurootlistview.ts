/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';

import DropdownMenuListView from './dropdownmenulistview.js';
import type ComponentFactory from '../../componentfactory.js';

/**
 * TODO
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * TODO
	 */
	public ofConfig( config: NormalizedMenuBarConfigObject, componentFactory: ComponentFactory ): void {
		const locale = this.locale!;
		const processedConfig = processMenuBarConfig( {
			normalizedConfig: config,
			locale,
			componentFactory
		} );

		const topLevelCategoryMenuViews = processedConfig.items.map( menuDefinition => this._createMenu( {
			componentFactory,
			menuDefinition
		} ) );

		this.children.addMany( topLevelCategoryMenuViews );
	}
}
