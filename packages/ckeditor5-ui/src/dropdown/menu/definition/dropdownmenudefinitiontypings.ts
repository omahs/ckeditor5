/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitiontypings
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuFlatItemView } from '../typings.js';
import type DropdownMenuView from '../dropdownmenuview.js';

/**
 * Represents the definition of a dropdown menu view item.
 */
export type DropdownMenuViewItemDefinition = DropdownMenuView | DropdownMenuFlatItemView;

/**
 * Represents the definition of a dropdown menu group.
 */
export type DropdownMenuGroupDefinition = {

	/**
	 * An array of items that belong to the dropdown menu group.
	 */
	items: Array<DropdownMenuDefinition | DropdownMenuViewItemDefinition>;
};

/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownMenuDefinition = {
	label: string;
	groups: Array<DropdownMenuGroupDefinition>;
};

/**
 * Represents the definition of a dropdown menu root factory.
 */
export type DropdownMenuRootFactoryDefinition = {

	/**
	 * An array of dropdown menu definitions.
	 */
	items: NonEmptyArray<DropdownMenuDefinition>;
};
