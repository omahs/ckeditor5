/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import DropdownMenuView from './dropdownmenuview.js';
import type { DropdownMenuFlatItem, DropdownMenuDefinition } from './typings.js';

export const isDropdownMenuView = ( obj: any ): obj is DropdownMenuView =>
	obj instanceof DropdownMenuView;

export const isDropdownMenuFlatItemView = ( obj: any ): obj is DropdownMenuFlatItem =>
	obj instanceof DropdownMenuListItemButtonView;

export const isDropdownMenuDefinition = ( obj: any ): obj is DropdownMenuDefinition =>
	obj && 'label' in obj && 'groups' in obj;
