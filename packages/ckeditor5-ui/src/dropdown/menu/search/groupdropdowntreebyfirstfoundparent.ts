/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/groupdropdowntreebyfirstfoundparent
 */

import type { DropdownMenusViewsFilteredTreeNode } from './filterdropdownmenutree.js';
import { flattenDropdownMenuTree } from './flattendropdownmenutree.js';

export function groupDropdownTreeByFirstFoundParent( tree: DropdownMenusViewsFilteredTreeNode ): FoundDropdownTreeParentsItemsMap {
	const flattenTree = flattenDropdownMenuTree( tree );

	return flattenTree.reduce<FoundDropdownTreeParentsItemsMap>(
		( acc, { parents, node } ) => {
			const firstFoundParent = parents.find(
				item => {
					if ( item.kind === 'Root' ) {
						return item;
					}

					return item.found;
				}
			)!;

			if ( !acc.has( firstFoundParent ) ) {
				acc.set( firstFoundParent, [ node ] );
			} else {
				acc.get( firstFoundParent )!.push( node );
			}

			return acc;
		},
		new Map()
	);
}

type FoundDropdownTreeParentsItemsMap = Map<DropdownMenusViewsFilteredTreeNode, Array<DropdownMenusViewsFilteredTreeNode>>;
