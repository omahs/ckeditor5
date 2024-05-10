/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/searchdropdowntreemenu
 */

import type { DropdownMenusViewsTreeNode } from './createtreefromflattenmenuviews';
import type { TreeSearchMetadata } from './dropdownmenutreesearchmetadata';

export function searchDropdownMenuTree(
	callback: DropdownMenuSearchCallback,
	tree: DropdownMenusViewsTreeNode
): void {
	console.info( callback, tree );
}

type DropdownMenuSearchCallback = ( search: TreeSearchMetadata ) => boolean;
