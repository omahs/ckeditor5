/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { BaseEvent } from '@ckeditor/ckeditor5-utils';

/**
 * @module ui/dropdown/menu/events
 */

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
