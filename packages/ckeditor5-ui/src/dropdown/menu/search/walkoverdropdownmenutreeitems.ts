/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/walkoverdropdownmenutreeitems
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type {
	DropdownMenusViewsTreeNode,
	DropdownMenusViewsTreeNodeKind,
	ExtractDropdownMenuViewTreeNodeByKind
} from './createtreefromflattendropdownmenuslist.js';

/**
 * Recursive tree menu visitor.
 */
export function walkOverDropdownMenuTreeItems<Extend>(
	walkers: DropdownMenuViewsTreeWalkers<Extend>,
	root: DropdownMenusViewsTreeNode<Extend>
): void {
	const parents: NonEmptyArray<DropdownMenusViewsTreeNode> = [ root ];
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

		if ( node !== root ) {
			parents.push( node );
		}

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

		if ( node !== root ) {
			parents.pop();
		}
	};

	visitor( root );
}

export type DropdownMenuViewsTreeWalkerMetadata<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> = {
	visitor: DropdownMenuViewsTreeVisitor;
	node: ExtractDropdownMenuViewTreeNodeByKind<K, Extend>;
	parents: NonEmptyArray<DropdownMenusViewsTreeNode<Extend>>;
	parent: DropdownMenusViewsTreeNode<Extend>;
};

export type DropdownMenuViewsTreeWalker<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> = {
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	enter?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K, Extend> ) => void | boolean;
	leave?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K, Extend> ) => void;
};

type DropdownMenuViewsTreeVisitor = ( node: DropdownMenusViewsTreeNode ) => void;

export type DropdownMenuViewsTreeWalkers<Extend = unknown> = {
	[ K in DropdownMenusViewsTreeNodeKind ]?: DropdownMenuViewsTreeWalker<K, Extend>;
};
