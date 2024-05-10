/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenuview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	getOptimalPosition,
	type Locale,
	type PositioningFunction,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import type { FocusableView } from '../../focuscycler.js';

import { DropdownMenuButtonView } from './dropdownmenubuttonview.js';
import { DropdownMenuViewPanelPositioningFunctions } from './utils/dropdownmenupositioningfunctions.js';
import { DropdownMenuBehaviors } from './utils/dropdownmenubehaviors.js';

import View from '../../view.js';
import {
	DropdownMenuPanelView,
	type DropdownMenuPanelPosition
} from './dropdownmenupanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenu.css';

/**
 * TODO
 */
export default class DropdownMenuView extends View implements FocusableView {
	/**
	 * Button of the menu view.
	 */
	public readonly buttonView: DropdownMenuButtonView;

	/**
	 * Panel of the menu. It hosts children of the menu.
	 */
	public readonly panelView: DropdownMenuPanelView;

	/**
	 * Tracks information about the DOM focus in the menu.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
	 * keystrokes of the menu.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Controls whether the menu is open, i.e. shows or hides the {@link #panelView panel}.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * Controls whether the menu is enabled, i.e. its {@link #buttonView} can be clicked.
	 *
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * (Optional) The additional CSS class set on the menu {@link #element}.
	 *
	 * @observable
	 */
	declare public class: string | undefined;

	/**
	 * The name of the position of the {@link #panelView}, relative to the menu.
	 *
	 * **Note**: The value is updated each time the panel gets {@link #isOpen open}.
	 *
	 * @observable
	 * @default 'w'
	 */
	declare public panelPosition: DropdownMenuPanelPosition;

	/**
	 * The parent menu view of the menu. It is `null` for top-level menus.
	 *
	 * See {@link module:ui/menubar/menubarview~MenuBarView#registerMenu}.
	 */
	declare public parentMenuView: DropdownMenuView | null;

	/**
	 * Creates an instance of the menu view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.buttonView = new DropdownMenuButtonView( locale );
		this.buttonView.delegate( 'mouseenter' ).to( this );
		this.buttonView.bind( 'isOn', 'isEnabled' ).to( this, 'isOpen', 'isEnabled' );

		this.panelView = new DropdownMenuPanelView( locale );
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.set( 'isOpen', false );
		this.set( 'isEnabled', true );
		this.set( 'panelPosition', 'w' );
		this.set( 'class', undefined );
		this.set( 'parentMenuView', null );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu__menu',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				]
			},

			children: [
				this.buttonView,
				this.panelView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.buttonView.element! );
		this.focusTracker.add( this.panelView.element! );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element! );

		DropdownMenuBehaviors.closeOnEscKey( this );

		this._repositionPanelOnOpen();
	}

	// For now, this method cannot be called in the render process because the `parentMenuView` may be assigned
	// after the rendering process.
	//
	// TODO: We should reconsider the way we handle this logic.
	/**
	 * Attach all keyboard behaviors for the menu bar view.
	 *
	 * @internal
	 */
	public _attachBehaviors(): void {
		DropdownMenuBehaviors.openOnButtonClick( this );
		DropdownMenuBehaviors.openOnArrowRightKey( this );
		DropdownMenuBehaviors.closeOnArrowLeftKey( this );
		DropdownMenuBehaviors.closeOnParentClose( this );
	}

	/**
	 * Sets the position of the panel when the menu opens. The panel is positioned
	 * so that it optimally uses the available space in the viewport.
	 */
	private _repositionPanelOnOpen(): void {
		// Let the menu control the position of the panel. The position must be updated every time the menu is open.
		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			const optimalPanelPosition = DropdownMenuView._getOptimalPosition( {
				element: this.panelView.element!,
				target: this.buttonView.element!,
				fitInViewport: true,
				positions: this._panelPositions
			} );

			this.panelView.position = (
				optimalPanelPosition ? optimalPanelPosition.name : this._panelPositions[ 0 ].name
			) as DropdownMenuPanelPosition;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.buttonView.focus();
	}

	/**
	 * TODO
	 */
	public get _panelPositions(): Array<PositioningFunction> {
		const { westSouth, eastSouth, westNorth, eastNorth } = DropdownMenuViewPanelPositioningFunctions;

		if ( this.locale!.uiLanguageDirection === 'ltr' ) {
			return [ eastSouth, eastNorth, westSouth, westNorth ];
		} else {
			return [ westSouth, westNorth, eastSouth, eastNorth ];
		}
	}

	/**
	 * A function used to calculate the optimal position for the dropdown panel.
	 *
	 * Referenced for unit testing purposes.
	 */
	private static _getOptimalPosition = getOptimalPosition;
}
