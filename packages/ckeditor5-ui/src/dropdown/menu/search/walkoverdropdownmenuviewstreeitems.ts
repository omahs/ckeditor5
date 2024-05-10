/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/walkoverdropdownmenuviewstreeitems
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type {
	DropdownMenusViewsTreeNode,
	DropdownMenusViewsTreeNodeKind,
	ExtractDropdownMenuViewTreeNodeByKind
} from './createtreefromflattenmenuviews';

/**
 * Recursive tree menu visitor.
 */
export function walkOverDropdownMenuViewsTreeItems(
	walkers: DropdownMenuViewsTreeWalkers,
	tree: DropdownMenusViewsTreeNode
): void {
	const parents: NonEmptyArray<DropdownMenusViewsTreeNode> = [ tree ];
	const visitor = ( node: DropdownMenusViewsTreeNode ) => {
		const {
			enter = () => {},
			leave = () => {}
		} = ( walkers[ node.kind ] || {} ) as DropdownMenuViewsTreeWalker;

		const walkerMetadata: DropdownMenuViewsTreeWalkerMetadata = {
			node,
			parents
		};

		enter( walkerMetadata );
		parents.push( node );

		switch ( node.kind ) {
			case 'Item':
				/* NOP */
				break;

			case 'Menu':
			case 'Root':
				node.children.forEach( visitor );
				break;

			default: {
				const unknownNode: never = node;
				console.warn( 'Unknown node kind!', unknownNode );
			}
		}

		parents.pop();
		leave( walkerMetadata );
	};

	visitor( tree );
}

type DropdownMenuViewsTreeWalkerMetadata<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind
> = {
	node: ExtractDropdownMenuViewTreeNodeByKind<K>;
	parents: Array<DropdownMenusViewsTreeNode>;
};

type DropdownMenuViewsTreeWalker<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind
> = {
	enter?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K> ) => undefined | false;
	leave?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K> ) => void;
};

type DropdownMenuViewsTreeWalkers = {
	[ K in DropdownMenusViewsTreeNodeKind ]: DropdownMenuViewsTreeWalker<K>;
};
