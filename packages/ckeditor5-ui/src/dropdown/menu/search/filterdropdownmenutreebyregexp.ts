/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/filterdropdownmenutreebyregexp
 */

import type { DeepReadonly } from '@ckeditor/ckeditor5-core/src/typings.js';
import type { DropdownMenuViewsRootTree } from './createtreefromflattendropdownmenuslist.js';

import { filterDropdownMenuTree, type DropdownMenuSearchResult } from './filterdropdownmenutree.js';

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
