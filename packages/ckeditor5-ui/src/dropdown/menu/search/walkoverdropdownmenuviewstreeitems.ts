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
	const visitor: DropdownMenuViewsTreeVisitor = node => {
		const {
			enter = () => {},
			leave = () => {}
		} = ( walkers[ node.kind ] || {} ) as DropdownMenuViewsTreeWalker;

		const walkerMetadata: DropdownMenuViewsTreeWalkerMetadata = {
			parents: [ ...parents ] as NonEmptyArray<DropdownMenusViewsTreeNode>,
			parent: parents[ parents.length - 1 ],
			node,
			visitor
		};

		parents.push( node );
		const result = enter( walkerMetadata );

		if ( result !== false ) {
			switch ( node.kind ) {
				case 'Item':
					/* NOP */
					break;

				case 'Menu':
				case 'Root':
					for ( let i = 0; i < node.children.length; ) {
						const child = node.children[ i ];

						visitor( child );

						// if it was removed - do not increment
						if ( child === node.children[ i ] ) {
							++i;
						}
					}
					break;

				default: {
					const unknownNode: never = node;
					console.warn( 'Unknown node kind!', unknownNode );
				}
			}
		}

		leave( walkerMetadata );
		parents.pop();
	};

	visitor( tree );
}

export type DropdownMenuViewsTreeWalkerMetadata<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind
> = {
	visitor: DropdownMenuViewsTreeVisitor;
	node: ExtractDropdownMenuViewTreeNodeByKind<K>;
	parents: NonEmptyArray<DropdownMenusViewsTreeNode>;
	parent: DropdownMenusViewsTreeNode;
};

export type DropdownMenuViewsTreeWalker<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind
> = {
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	enter?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K> ) => void | boolean;
	leave?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K> ) => void;
};

type DropdownMenuViewsTreeVisitor = ( node: DropdownMenusViewsTreeNode ) => void;

type DropdownMenuViewsTreeWalkers = {
	[ K in DropdownMenusViewsTreeNodeKind ]?: DropdownMenuViewsTreeWalker<K>;
};
