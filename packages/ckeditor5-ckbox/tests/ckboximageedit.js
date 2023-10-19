/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { global } from '@ckeditor/ckeditor5-utils';

import CKBoxImageEdit from '../src/ckboximageedit';
import CKBoxImageEditEditing from '../src/ckboximageedit/ckboximageeditediting';
import CKBoxImageEditUI from '../src/ckboximageedit/ckboximageeditui.ts';

describe( 'CKBoxImageEdit', () => {
	it( 'should be correctly named', () => {
		expect( CKBoxImageEdit.pluginName ).to.equal( 'CKBoxImageEdit' );
	} );

	describe( 'init()', () => {
		let domElement, editor;

		beforeEach( async () => {
			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicEditor.create( domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					CKBoxImageEdit
				]
			} );
		} );

		afterEach( () => {
			domElement.remove();
			return editor.destroy();
		} );

		it( 'should load CKBoxImageEdit plugin', () => {
			const CKBoxImageEditPlugin = editor.plugins.get( 'CKBoxImageEdit' );

			expect( CKBoxImageEditPlugin ).to.be.an.instanceof( CKBoxImageEdit );
		} );

		it( 'should have proper "requires" value', () => {
			expect( CKBoxImageEdit.requires ).to.deep.equal( [
				CKBoxImageEditEditing,
				CKBoxImageEditUI
			] );
		} );

		it( 'should load CKBoxImageEditEditing plugin', () => {
			expect( editor.plugins.get( CKBoxImageEditEditing ) ).to.instanceOf( CKBoxImageEditEditing );
		} );

		it( 'should load CKBoxImageEditUI plugin', () => {
			expect( editor.plugins.get( CKBoxImageEditUI ) ).to.instanceOf( CKBoxImageEditUI );
		} );
	} );
} );
