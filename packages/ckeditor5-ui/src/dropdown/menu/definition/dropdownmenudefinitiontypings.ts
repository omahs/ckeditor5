/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitiontypings
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuFlatItemView } from '../typings.js';
import type DropdownMenuView from '../dropdownmenuview.js';

export type DropdownMenuViewItemDefinition = DropdownMenuView | DropdownMenuFlatItemView;

export type DropdownMenuGroupDefinition = {
	items: Array<DropdownMenuDefinition | DropdownMenuViewItemDefinition>;
};

export type DropdownMenuDefinition = {
	label: string;
	groups: Array<DropdownMenuGroupDefinition>;
};

/**
 * TODO
 */
export type DropdownMenuRootFactoryDefinition = {
	locale: Locale;
	items: NonEmptyArray<DropdownMenuDefinition>;
};
