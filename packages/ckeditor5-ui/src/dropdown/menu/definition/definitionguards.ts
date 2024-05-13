/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/definitionguards
 */

import type { DropdownMenuDefinition } from './definitiontypings.js';

export const isDropdownMenuDefinition = ( obj: any ): obj is DropdownMenuDefinition =>
	obj && 'label' in obj && 'groups' in obj;
