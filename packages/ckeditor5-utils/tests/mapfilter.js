/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import mapFilter from '../src/mapfilter.js';

const MOCK_MAP = new Map( [
	[ 'a', 123 ],
	[ 'b', 555 ],
	[ 'foo', { a: 2 } ]
] );

describe( 'mapFilter', () => {
	it( 'should return copy of map', () => {
		const result = mapFilter( () => true, MOCK_MAP );

		expect( result ).to.not.be.equal( MOCK_MAP );
		expect( result ).to.deep.equal( MOCK_MAP );
	} );

	it( 'should not crash on empty map', () => {
		const result = mapFilter( () => true, new Map() );

		expect( result ).to.deep.equal( new Map() );
	} );

	it( 'should filter map using passed callback', () => {
		const result = mapFilter( key => ![ 'a', 'b' ].includes( key ), MOCK_MAP );

		expect( result ).to.deep.equal(
			new Map( [
				[ 'foo', { a: 2 } ]
			] )
		);
	} );
} );
