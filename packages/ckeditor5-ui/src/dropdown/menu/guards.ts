/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/guards
 */

import type { DropdownMenuFlatItemView } from './typings.js';

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import DropdownMenuView from './dropdownmenuview.js';

/**
 * Checks if the given object is an instance of DropdownMenuView.
 *
 * @param obj The object to check.
 * @returns A boolean indicating whether the object is an instance of DropdownMenuView.
 */
export const isDropdownMenuView = ( obj: any ): obj is DropdownMenuView =>
	obj instanceof DropdownMenuView;

/**
 * Checks if the given object is an instance of `DropdownMenuFlatItemView`.
 *
 * @param obj The object to check.
 * @returns A boolean indicating whether the object is an instance of `DropdownMenuFlatItemView`.
 */
export const isDropdownMenuFlatItemView = ( obj: any ): obj is DropdownMenuFlatItemView =>
	obj instanceof DropdownMenuListItemButtonView;
