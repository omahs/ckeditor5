/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/filterdropdownmenutreebyregexp
 */

import type { DeepReadonly } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuViewsRootTree } from './createtreefromflattendropdownmenuslist.js';

import { filterDropdownMenuTree, type DropdownMenuSearchResult } from './filterdropdownmenutree.js';

/**
 * Filters a dropdown menu tree by a regular expression.
 *
 * @param regExp - The regular expression used for filtering. If null, returns the tree with all items.
 * @param tree - The dropdown menu tree to filter.
 * @returns The filtered dropdown menu tree.
 */
export const filterDropdownMenuTreeByRegExp = (
	regExp: RegExp | null,
	tree: DeepReadonly<DropdownMenuViewsRootTree>
): DropdownMenuSearchResult =>
	filterDropdownMenuTree(
		( { search } ) => {
			// If no regExp provided treat every item as matching.
			if ( !regExp ) {
				return true;
			}

			return !!( search.text || '' ).match( regExp );
		},
		tree
	);
