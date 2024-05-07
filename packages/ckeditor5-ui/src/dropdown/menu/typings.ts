/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { BaseEvent } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuView } from './dropdownmenuview.js';
import type { DropdownMenuListItemButtonView } from './dropdownmenulistitembuttonview.js';

/**
 * @module ui/dropdown/menu/typings
 */

export type DropdownMenuConfigObject = {
	items?: Array<DropdownMenuDefinition>;
	isVisible?: boolean;
};

export type DropdownComponentCreator = () => DropdownMenuView | DropdownMenuListItemButtonView;

export type DropdownMenuDefinition = {
	menuId: string;
	label: string;
	groups: Array<DropdownMenuGroupDefinition>;
};

export type DropdownMenuGroupDefinition = {
	groupId: string;
	items: Array<DropdownMenuDefinition | DropdownComponentCreator>;
};

export type NormalizedDropdownMenuConfigObject = Required<DropdownMenuConfigObject> & {
	isUsingDefaultConfig: boolean;
};

export type DropdownMenuConfig = DropdownMenuConfigObject;

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
export interface DropdownMenuArrowLeftEvent extends DropdownMenuEvent {
	name: 'menu:arrowleft';
}

/**
 * TODO
 */
export interface DropdownMenuArrowRightEvent extends DropdownMenuEvent {
	name: 'menu:arrowright';
}

/**
 * TODO
 */
export interface DropdownMenuChangeIsOpenEvent extends DropdownMenuEvent {
	name: 'menu:change:isOpen';
	args: [ name: string, value: boolean, oldValue: boolean ];
}
