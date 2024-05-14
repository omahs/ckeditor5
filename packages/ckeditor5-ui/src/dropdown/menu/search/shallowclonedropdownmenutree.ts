/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/shallowclonedropdownmenutree
 */

import type { DeepReadonly } from '@ckeditor/ckeditor5-core';
import type { DropdownMenusViewsTreeNode } from './createtreefromflattendropdownmenuslist.js';

import { cloneDeepWith } from 'lodash-es';
import View from '../../../view.js';

/**
 * Creates a shallow clone of the dropdown menu tree, excluding instances of the View class.
 *
 * @param tree The dropdown menu tree to clone.
 * @returns The shallow clone of the dropdown menu tree.
 */
export function shallowCloneDropdownMenuTree( tree: DeepReadonly<DropdownMenusViewsTreeNode> ): DropdownMenusViewsTreeNode {
	return cloneDeepWith( tree, ( element ): any => {
		if ( typeof element === 'object' && element instanceof View ) {
			return element;
		}
	} );
}
