/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/definitionguards
 */

import type { DropdownMenuFlatItemView } from './typings.js';

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import DropdownMenuView from './dropdownmenuview.js';

export const isDropdownMenuView = ( obj: any ): obj is DropdownMenuView =>
	obj instanceof DropdownMenuView;

export const isDropdownMenuFlatItemView = ( obj: any ): obj is DropdownMenuFlatItemView =>
	obj instanceof DropdownMenuListItemButtonView;
