/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { BaseEvent } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuView } from './dropdownmenuview.js';
import type DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import View from '../../view.js';

/**
 * @module ui/dropdown/menu/typings
 */

export type DropdownMenuViewComponent = DropdownMenuView | DropdownMenuListItemButtonView;

export type DropdownMenuGroupDefinition = {
	items: Array<DropdownMenuDefinition | DropdownMenuViewComponent>;
};

export type DropdownMenuDefinition = {
	label: string;
	groups: Array<DropdownMenuGroupDefinition>;
};

export const isDropdownMenuViewComponent = ( obj: DropdownMenuDefinition | DropdownMenuViewComponent ): obj is DropdownMenuViewComponent =>
	obj instanceof View;

/**
 * TODO
 */
interface DropdownMenuEvent extends BaseEvent {
	name: `menu:${ string }` | `menu:change:${ string }`;
}

/**
 * TODO
 */
export interface DropdownMenuMouseEnterEvent extends DropdownMenuEvent {
	name: 'menu:mouseenter';
}

/**
 * TODO
 */
export interface DropdownMenuChangeIsOpenEvent extends DropdownMenuEvent {
	name: 'menu:change:isOpen';
	args: [ name: string, value: boolean, oldValue: boolean ];
}
