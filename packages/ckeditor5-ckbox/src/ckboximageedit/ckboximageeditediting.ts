/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/ckboximageeditediting
 */

import { Plugin } from 'ckeditor5/src/core';
import CKBoxImageEditCommand from './ckboximageeditcommand';

/**
 * The CKBox image edit editing plugin.
 */
export default class CKBoxImageEditEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxImageEditEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;

		editor.commands.add( 'ckboxImageEdit', new CKBoxImageEditCommand( editor ) );
	}
}
