/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { PositioningFunction } from '@ckeditor/ckeditor5-utils';

/**
 * @module ui/dropdown/menu/utils/dropdownmenupositioningfunctions
 */

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

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
	southEast: buttonRect => ( {
		top: buttonRect.bottom,
		left: buttonRect.left,
		name: 'se'
	} ),

	southWest: ( buttonRect, panelRect ) => ( {
		top: buttonRect.bottom,
		left: buttonRect.left - panelRect.width + buttonRect.width,
		name: 'sw'
	} ),

	northEast: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height,
		left: buttonRect.left,
		name: 'ne'
	} ),

	northWest: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height,
		left: buttonRect.left - panelRect.width + buttonRect.width,
		name: 'nw'
	} ),

	eastSouth: buttonRect => ( {
		top: buttonRect.top,
		left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'es'
	} ),

	eastNorth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height,
		left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'en'
	} ),

	westSouth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top,
		left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'ws'
	} ),

	westNorth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height,
		left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'wn'
	} )
} as const;
