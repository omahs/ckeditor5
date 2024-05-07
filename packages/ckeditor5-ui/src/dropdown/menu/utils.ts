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
	DropdownMenuArrowLeftEvent,
	DropdownMenuDefinition,
	NormalizedDropdownMenuConfigObject
} from './typings.js';

import { cloneDeep } from 'lodash-es';
import type { FocusableView } from '../../focuscycler.js';
import {
	logWarning,
	type ObservableChangeEvent,
	type PositioningFunction
} from '@ckeditor/ckeditor5-utils';

import type { ButtonExecuteEvent } from '../../button/button.js';
import type ComponentFactory from '../../componentfactory.js';
import type DropdownMenuRootListView from './dropdownmenurootlistview.js';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

type DeepReadonly<T> = Readonly<{
	[K in keyof T]:
		T[K] extends string ? Readonly<T[K]>
			: T[K] extends Array<infer A> ? Readonly<Array<DeepReadonly<A>>>
				: DeepReadonly<T[K]>;
}>;

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

/**
 * Processes a normalized menu bar config and returns a config clone with the following modifications:
 *
 * * Removed components that are not available in the component factory,
 * * Removed obsolete separators,
 * * Purged empty menus,
 * * Localized top-level menu labels.
 */
export function processDropdownMenuConfig( {
	normalizedConfig,
	componentFactory
}: {
	normalizedConfig: NormalizedDropdownMenuConfigObject;
	componentFactory: ComponentFactory;
} ): NormalizedDropdownMenuConfigObject {
	const configClone = cloneDeep( normalizedConfig ) as NormalizedDropdownMenuConfigObject;

	purgeUnavailableComponents( normalizedConfig, configClone, componentFactory );
	purgeEmptyMenus( normalizedConfig, configClone );

	return configClone;
}

/**
 * Removes components from the menu bar configuration that are not available in the factory and would
 * not be instantiated. Warns about missing components if the menu bar configuration was specified by the user.
 */
function purgeUnavailableComponents(
	originalConfig: DeepReadonly<NormalizedDropdownMenuConfigObject>,
	config: NormalizedDropdownMenuConfigObject,
	componentFactory: ComponentFactory
) {
	walkConfigMenus( config.items, menuDefinition => {
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				const isItemUnavailable = typeof item === 'string' && !componentFactory.has( item );

				// The default configuration contains all possible editor features. But integrators' editors rarely load
				// every possible feature. This is why we do not want to log warnings about unavailable items for the default config
				// because they would show up in almost every integration. If the configuration has been provided by
				// the integrator, on the other hand, then these warnings bring value.
				if ( isItemUnavailable && !config.isUsingDefaultConfig ) {
					/**
					 * There was a problem processing the configuration of the menu bar. The item with the given
					 * name does not exist so it was omitted when rendering the menu bar.
					 *
					 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
					 * to provide a menu bar item has not been loaded or there is a typo in the
					 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration}.
					 *
					 * Make sure the plugin responsible for this menu bar item is loaded and the menu bar configuration
					 * is correct, e.g. {@link module:basic-styles/bold/boldui~BoldUI} is loaded for the `'menuBar:bold'`
					 * menu bar item.
					 *
					 * @error menu-bar-item-unavailable
					 * @param menuBarConfig The full configuration of the menu bar.
					 * @param parentMenuConfig The config of the menu the unavailable component was defined in.
					 * @param componentName The name of the unavailable component.
					 */
					logWarning( 'menu-bar-item-unavailable', {
						menuBarConfig: originalConfig,
						parentMenuConfig: cloneDeep( menuDefinition ),
						componentName: item
					} );
				}

				return !isItemUnavailable;
			} );
		}
	} );
}

/**
 * Removes empty menus from the menu bar configuration to improve the visual UX. Such menus can occur
 * when some plugins responsible for providing menu bar items have not been loaded and some part of
 * the configuration populated menus using these components exclusively.
 */
function purgeEmptyMenus(
	originalConfig: NormalizedDropdownMenuConfigObject,
	config: NormalizedDropdownMenuConfigObject
) {
	const isUsingDefaultConfig = config.isUsingDefaultConfig;
	let wasSubMenuPurged = false;

	// Purge top-level menus.
	config.items = config.items.filter( menuDefinition => {
		if ( !menuDefinition.groups.length ) {
			warnAboutEmptyMenu( originalConfig, menuDefinition, isUsingDefaultConfig );

			return false;
		}

		return true;
	} );

	// Warn if there were no top-level menus left in the menu bar after purging.
	if ( !config.items.length ) {
		warnAboutEmptyMenu( originalConfig, originalConfig, isUsingDefaultConfig );

		return;
	}

	// Purge sub-menus and groups.
	walkConfigMenus( config.items, menuDefinition => {
		// Get rid of empty groups.
		menuDefinition.groups = menuDefinition.groups.filter( groupDefinition => {
			if ( !groupDefinition.items.length ) {
				wasSubMenuPurged = true;
				return false;
			}

			return true;
		} );

		// Get rid of empty sub-menus.
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				// If no groups were left after removing empty ones.
				if ( isMenuDefinition( item ) && !item.groups.length ) {
					warnAboutEmptyMenu( originalConfig, item, isUsingDefaultConfig );
					wasSubMenuPurged = true;
					return false;
				}

				return true;
			} );
		}
	} );

	if ( wasSubMenuPurged ) {
		// The config is walked from the root to the leaves so if anything gets removed, we need to re-run the
		// whole process because it could've affected parents.
		purgeEmptyMenus( originalConfig, config );
	}
}

function warnAboutEmptyMenu(
	originalConfig: NormalizedDropdownMenuConfigObject,
	emptyMenuConfig: DropdownMenuDefinition | DeepReadonly<NormalizedDropdownMenuConfigObject>,
	isUsingDefaultConfig: boolean
) {
	if ( isUsingDefaultConfig ) {
		return;
	}

	/**
	 * There was a problem processing the configuration of the menu bar. One of the menus
	 * is empty so it was omitted when rendering the menu bar.
	 *
	 * This warning usually shows up when some {@link module:core/plugin~Plugin plugins} responsible for
	 * providing menu bar items have not been loaded and the
	 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration} was not updated.
	 *
	 * Make sure all necessary editor plugins are loaded and/or update the menu bar configuration
	 * to account for the missing menu items.
	 *
	 * @error menu-bar-menu-empty
	 * @param menuBarConfig The full configuration of the menu bar.
	 * @param emptyMenuConfig The definition of the menu that has no child items.
	 */
	logWarning( 'menu-bar-menu-empty', {
		menuBarConfig: originalConfig,
		emptyMenuConfig
	} );
}

/**
 * Recursively visits all menu definitions in the config and calls the callback for each of them.
 */
function walkConfigMenus(
	definition: NormalizedDropdownMenuConfigObject[ 'items' ] | DropdownMenuDefinition,
	callback: ( definition: DropdownMenuDefinition ) => void
) {
	if ( Array.isArray( definition ) ) {
		for ( const topLevelMenuDefinition of definition ) {
			walk( topLevelMenuDefinition );
		}
	}

	function walk( menuDefinition: DropdownMenuDefinition ) {
		callback( menuDefinition );

		for ( const groupDefinition of menuDefinition.groups ) {
			for ( const groupItem of groupDefinition.items ) {
				if ( isMenuDefinition( groupItem ) ) {
					walk( groupItem );
				}
			}
		}
	}
}

function isMenuDefinition( definition: any ): definition is DropdownMenuDefinition {
	return typeof definition === 'object' && 'menuId' in definition;
}
