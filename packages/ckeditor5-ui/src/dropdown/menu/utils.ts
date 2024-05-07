/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils
 */

import { DropdownMenuListItemView } from './dropdownmenulistitemview.js';
import type { DropdownMenuView } from './dropdownmenuview.js';
import type {
	DropdownMenuMouseEnterEvent,
	DropdownMenuChangeIsOpenEvent,
	DropdownMenuArrowRightEvent,
	DropdownMenuArrowLeftEvent
} from './typings.js';

import type { FocusableView } from '../../focuscycler.js';
import type { ObservableChangeEvent, PositioningFunction } from '@ckeditor/ckeditor5-utils';

import type { ButtonExecuteEvent } from '../../button/button.js';
import type DropdownMenuRootListView from './dropdownmenurootlistview.js';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

/**
 * Behaviors of the {@link module:ui/menubar/menubarview~MenuBarView} component.
 */
export const DropdownRootMenuBehaviors = {
	/**
	 * When the bar is already open:
	 * * Opens the menu when the user hovers over its button.
	 * * Closes open menu when another menu's button gets hovered.
	 */
	toggleMenusAndFocusItemsOnHover( menuBarView: DropdownMenuRootListView ): void {
		menuBarView.on<DropdownMenuMouseEnterEvent>( 'menu:mouseenter', evt => {
			for ( const menuView of menuBarView.items as unknown as Array<DropdownMenuView> ) {
				// @if CK_DEBUG_MENU_BAR // const wasOpen = menuView.isOpen;

				const pathLeaf = evt.path[ 0 ];
				const isListItemContainingMenu = pathLeaf instanceof DropdownMenuListItemView && pathLeaf.children.first === menuView;

				menuView.isOpen = ( evt.path.includes( menuView ) || isListItemContainingMenu ) && menuView.isEnabled;

				// @if CK_DEBUG_MENU_BAR // if ( wasOpen !== menuView.isOpen ) {
				// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] toggleMenusAndFocusItemsOnHover(): Toggle',
				// @if CK_DEBUG_MENU_BAR // 	logMenu( menuView ), 'isOpen', menuView.isOpen
				// @if CK_DEBUG_MENU_BAR // );
				// @if CK_DEBUG_MENU_BAR // }
			}

			( evt.source as FocusableView ).focus();
		} );
	},

	/**
	 * Moves between top-level menus using the arrow left and right keys.
	 *
	 * If the menubar has already been open, the arrow keys move focus between top-level menu buttons and open them.
	 * If the menubar is closed, the arrow keys only move focus between top-level menu buttons.
	 */
	focusCycleMenusOnArrows( menuBarView: DropdownMenuRootListView ): void {
		const isContentRTL = menuBarView.locale!.uiLanguageDirection === 'rtl';

		menuBarView.on<DropdownMenuArrowRightEvent>( 'menu:arrowright', evt => {
			cycleTopLevelMenus( evt.source as DropdownMenuView, isContentRTL ? -1 : 1 );
		} );

		menuBarView.on<DropdownMenuArrowLeftEvent>( 'menu:arrowleft', evt => {
			cycleTopLevelMenus( evt.source as DropdownMenuView, isContentRTL ? 1 : -1 );
		} );

		function cycleTopLevelMenus( currentMenuView: DropdownMenuView, step: number ) {
			const currentIndex = menuBarView.items.getIndex( currentMenuView );
			const isCurrentMenuViewOpen = currentMenuView.isOpen;
			const menusCount = menuBarView.items.length;
			const menuViewToOpen = menuBarView.items.get( ( currentIndex + menusCount + step ) % menusCount )! as DropdownMenuView;

			currentMenuView.isOpen = false;

			if ( isCurrentMenuViewOpen ) {
				menuViewToOpen.isOpen = true;
			}

			menuViewToOpen.buttonView.focus();
		}
	},

	/**
	 * Handles the following case:
	 * 1. Hover to open a sub-menu (A). The button has focus.
	 * 2. Press arrow up/down to move focus to another sub-menu (B) button.
	 * 3. Press arrow right to open the sub-menu (B).
	 * 4. The sub-menu (A) should close as it would with `toggleMenusAndFocusItemsOnHover()`.
	 */
	closeMenuWhenAnotherOnTheSameLevelOpens( menuBarView: DropdownMenuRootListView ): void {
		menuBarView.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			if ( isOpen ) {
				menuBarView.items
					.filter( ( menuView: any ) => {
						return ( evt.source as any ).parentMenuView === menuView.parentMenuView &&
							evt.source !== menuView &&
							menuView.isOpen;
					} ).forEach( ( menuView: any ) => {
						menuView.isOpen = false;

						// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] closeMenuWhenAnotherOpens(): Closing', logMenu( menuView ) );
					} );
			}
		} );
	}
};

/**
 * Behaviors of the {@link module:ui/menubar/DropdownMenuview~DropdownMenuView} component.
 */
export const DropdownMenuBehaviors = {
	/**
	 * If the button of the menu is focused, pressing the arrow down key should open the panel and focus it.
	 * This is analogous to the {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
	openAndFocusPanelOnArrowDownKey( menuView: DropdownMenuView ): void {
		menuView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement === menuView.buttonView.element ) {
				if ( !menuView.isOpen ) {
					menuView.isOpen = true;
				}

				menuView.panelView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Open the menu on the right arrow key press. This allows for navigating to sub-menus using the keyboard.
	 */
	openOnArrowRightKey( menuView: DropdownMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowleft' : 'arrowright';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element || !menuView.isEnabled ) {
				return;
			}

			// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] openOnArrowRightKey(): Opening', logMenu( menuView ) );

			if ( !menuView.isOpen ) {
				menuView.isOpen = true;
			}

			menuView.panelView.focus();
			cancel();
		} );
	},

	/**
	 * Opens the menu on its button click. Note that this behavior only opens but never closes the menu (unlike
	 * {@link module:ui/dropdown/dropdownview~DropdownView}).
	 */
	openOnButtonClick( menuView: DropdownMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = true;
			menuView.panelView.focus();
		} );
	},

	/**
	 * Toggles the menu on its button click. This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
	toggleOnButtonClick( menuView: DropdownMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = !menuView.isOpen;

			if ( menuView.isOpen ) {
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * Closes the menu on the right left key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnArrowLeftKey( menuView: DropdownMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowright' : 'arrowleft';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Closes the menu on the esc key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnEscKey( menuView: DropdownMenuView ): void {
		menuView.keystrokes.set( 'esc', ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Closes the menu when its parent menu also closed. This prevents from orphaned open menus when the parent menu re-opens.
	 */
	closeOnParentClose( menuView: DropdownMenuView ): void {
		menuView.parentMenuView!.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen && evt.source === menuView.parentMenuView ) {
				// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] closeOnParentClose(): Closing', logMenu( menuView ) );

				menuView.isOpen = false;
			}
		} );
	}
};

// @if CK_DEBUG_MENU_BAR // function logMenu( menuView: DropdownMenuView ) {
// @if CK_DEBUG_MENU_BAR //	return `"${ menuView.buttonView.label }"`;
// @if CK_DEBUG_MENU_BAR // }

/**
 * Contains every positioning function used by {@link module:ui/menubar/DropdownMenuview~DropdownMenuView} that decides where the
 * {@link module:ui/menubar/DropdownMenuview~DropdownMenuView#panelView} should be placed.
 *
 * Top-level menu positioning functions:
 *
 *	┌──────┐
 *	│      │
 *	├──────┴────────┐
 *	│               │
 *	│               │
 *	│               │
 *	│            SE │
 *	└───────────────┘
 *
 *	         ┌──────┐
 *	         │      │
 *	┌────────┴──────┤
 *	│               │
 *	│               │
 *	│               │
 *	│ SW            │
 *	└───────────────┘
 *
 *	┌───────────────┐
 *	│ NW            │
 *	│               │
 *	│               │
 *	│               │
 *	└────────┬──────┤
 *	         │      │
 *	         └──────┘
 *
 *	┌───────────────┐
 *	│            NE │
 *	│               │
 *	│               │
 *	│               │
 *	├──────┬────────┘
 *	│      │
 *	└──────┘
 *
 * Sub-menu positioning functions:
 *
 *	┌──────┬───────────────┐
 *	│      │               │
 *	└──────┤               │
 *	       │               │
 *	       │            ES │
 *	       └───────────────┘
 *
 *	┌───────────────┬──────┐
 *	│               │      │
 *	│               ├──────┘
 *	│               │
 *	│ WS            │
 *	└───────────────┘
 *
 *	       ┌───────────────┐
 *	       │            EN │
 *	       │               │
 *	┌──────┤               │
 *	│      │               │
 *	└──────┴───────────────┘
 *
 *	┌───────────────┐
 *	│ WN            │
 *	│               │
 *	│               ├──────┐
 *	│               │      │
 *	└───────────────┴──────┘
 */
export const DropdownMenuViewPanelPositioningFunctions: Record<string, PositioningFunction> = {
	southEast: buttonRect => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left,
			name: 'se'
		};
	},
	southWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'sw'
		};
	},
	northEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left,
			name: 'ne'
		};
	},
	northWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'nw'
		};
	},
	eastSouth: buttonRect => {
		return {
			top: buttonRect.top,
			left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'es'
		};
	},
	eastNorth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'en'
		};
	},
	westSouth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top,
			left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'ws'
		};
	},
	westNorth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'wn'
		};
	}
} as const;
