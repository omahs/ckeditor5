/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/dropdownmenutreesearchmetadata
 */

export type TreeSearchMetadata = {
	raw: string;
	text: string;
};

export type WithTreeSearchMetadata = {
	search: TreeSearchMetadata;
};

export const normalizeSearchText = ( text: string ): string => text.trim().toLowerCase();

export const createTextSearchMetadata = ( label: string | undefined ): TreeSearchMetadata => ( {
	raw: label || '',
	text: normalizeSearchText( label || '' )
} );
