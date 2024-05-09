/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import { DropdownMenuView } from './dropdownmenuview.js';
import type { DropdownMenuViewItem, DropdownMenuButtonLikeItem, DropdownMenuDefinition } from './typings.js';

export const isDropdownMenuView = ( obj: any ): obj is DropdownMenuView =>
	obj instanceof DropdownMenuView;

export const isDropdownMenuButtonLikeViewItem = ( obj: any ): obj is DropdownMenuButtonLikeItem =>
	obj instanceof DropdownMenuListItemButtonView;

export const isDropdownMenuOrButtonLikeItem = ( obj: DropdownMenuDefinition | DropdownMenuViewItem ): obj is DropdownMenuViewItem =>
	isDropdownMenuButtonLikeViewItem( obj ) || isDropdownMenuView( obj );
