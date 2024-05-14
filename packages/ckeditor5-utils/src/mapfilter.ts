/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/mapfilter
 */

/**
 * Filters a Map object based on a callback function.
 *
 * @param callback The callback function that determines whether a key-value pair should be included in the output.
 *                 It takes a key and a value as arguments and returns a boolean.
 * @param map The input Map object to be filtered.
 * @returns A new Map object that includes only the key-value pairs for which the callback function returned true.
 *
 * @example
 * 	const myMap = new Map([['a', 1], ['b', 2], ['c', 3]]);
 * 	const isEven = (key, value) => value % 2 === 0;
 * 	const filteredMap = mapFilter(isEven, myMap);
 * 	console.log([...filteredMap]); // Outputs [['b', 2]]
 */
export default function mapFilter<K, V>(
	callback: ( key: K, value: V ) => boolean,
	map: Map<K, V>
): Map<K, V> {
	const output = new Map<K, V>();

	for ( const [ key, value ] of map.entries() ) {
		if ( callback( key, value ) ) {
			output.set( key, value );
		}
	}

	return output;
}
