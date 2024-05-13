/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/groupdropdowntreebyfirstfoundparent
 */

import { flattenDropdownMenuTree } from './flattendropdownmenutree.js';

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type { DropdownMenusViewsFilteredFlatItem, DropdownMenusViewsFilteredTreeNode } from './filterdropdownmenutree.js';

export function groupDropdownTreeByFirstFoundParent( tree: DropdownMenusViewsFilteredTreeNode ): Array<GroupedDropdownTreeFlatEntry> {
	const findGroupingParent = ( parents: NonEmptyArray<DropdownMenusViewsFilteredTreeNode> ): DropdownMenusViewsFilteredTreeNode => {
		const maybeFirstFoundParent = [ ...parents ].reverse().find(
			item => {
				if ( item.kind === 'Root' ) {
					return false;
				}

				return item.found;
			}
		);

		if ( maybeFirstFoundParent ) {
			return maybeFirstFoundParent;
		}

		return parents[ parents.length - 1 ];
	};

	const groupedParents = flattenDropdownMenuTree( tree ).reduce<FoundDropdownTreeParentsItemsMap>(
		( acc, { parents, node } ) => {
			const groupingParent = findGroupingParent( parents );

			if ( !acc.has( groupingParent ) ) {
				acc.set( groupingParent, [ node ] );
			} else {
				acc.get( groupingParent )!.push( node );
			}

			return acc;
		},
		new Map()
	);

	return Array
		.from( groupedParents )
		.map( ( [ parent, children ] ) => ( {
			parent,
			children
		} ) );
}

type FoundDropdownTreeParentsItemsMap = Map<DropdownMenusViewsFilteredTreeNode, Array<DropdownMenusViewsFilteredFlatItem>>;

type GroupedDropdownTreeFlatEntry = {
	parent: DropdownMenusViewsFilteredTreeNode;
	children: Array<DropdownMenusViewsFilteredFlatItem>;
};
