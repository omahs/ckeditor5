/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/mapfilter
 */

export default function mapFilter<K, V>( callback: ( key: K, value: V ) => boolean, map: Map<K, V> ): Map<K, V> {
	const output = new Map<K, V>();

	for ( const [ key, value ] of map.entries() ) {
		if ( callback( key, value ) ) {
			output.set( key, value );
		}
	}

	return output;
}
