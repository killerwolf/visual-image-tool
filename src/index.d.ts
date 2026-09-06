/**
 * Type declarations for @h4md1/visual-image-tool
 *
 * All coordinates and dimensions are expressed in the image's *original*
 * pixels, not the displayed (scaled) pixels, so they stay valid whatever
 * size the image is rendered at.
 */

/** A point in original image pixels. */
export interface FocusPoint {
	x: number;
	y: number;
}

/** A rectangle in original image pixels. */
export interface CropZone {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** The image's intrinsic size in pixels. */
export interface ImageDimensions {
	width: number;
	height: number;
}

/** The payload handed to `onChange` whenever anything moves. */
export interface ChangeData {
	focusPoint: FocusPoint;
	cropZone: CropZone;
	focusActive: boolean;
	cropActive: boolean;
}

/**
 * Appearance of the focus point marker.
 *
 * Merged into the defaults, so overriding one property leaves the rest alone.
 */
export interface FocusPointStyle {
	width?: string;
	height?: string;
	border?: string;
	boxShadow?: string;
	backgroundColor?: string;
}

/**
 * Appearance of the crop overlay.
 *
 * Merged into the defaults — see {@link FocusPointStyle}.
 */
export interface CropZoneStyle {
	border?: string;
	backgroundColor?: string;
}

/**
 * Appearance of the eight crop resize handles.
 *
 * Merged into the defaults — see {@link FocusPointStyle}.
 */
export interface CropHandleStyle {
	width?: string;
	height?: string;
	backgroundColor?: string;
	border?: string;
	boxShadow?: string;
}

export interface FocusPointOptions {
	/** Set false to disable the focus point entirely. Defaults to true. */
	enabled?: boolean;
	style?: FocusPointStyle;
}

export interface CropZoneOptions {
	/** Set false to disable the crop zone entirely. Defaults to true. */
	enabled?: boolean;
	style?: CropZoneStyle;
	handleStyle?: CropHandleStyle;
}

export interface VisualImageToolOptions {
	/** The `<img>` to attach to, or a CSS selector resolving to one. */
	imageElement: HTMLImageElement | HTMLElement | string;
	focusPoint?: FocusPointOptions;
	cropZone?: CropZoneOptions;
	/** Called whenever the focus point or crop zone changes. */
	onChange?: (data: ChangeData) => void;
	/** Logs overlay positioning details to the console. Defaults to false. */
	debug?: boolean;
}

export declare class VisualImageTool {
	/**
	 * @throws if `imageElement` is missing, or does not resolve to an `<img>`.
	 */
	constructor(options: VisualImageToolOptions);

	/**
	 * Shows or hides the focus point. Omit `active` to toggle.
	 *
	 * The first time this is enabled, a focus point still sitting at its
	 * initial `{x: 0, y: 0}` is moved to the centre of the image — so read it
	 * back with {@link getFocusPoint} afterwards rather than before.
	 */
	toggleFocusPoint(active?: boolean): this;

	/** Shows or hides the crop zone. Omit `active` to toggle. */
	toggleCropZone(active?: boolean): this;

	/** Moves the focus point. Coordinates are clamped to the image. */
	setFocusPoint(x: number, y: number): this;

	/**
	 * Moves and resizes the crop zone. Values are clamped to the image, and
	 * width and height are held to a 10px minimum.
	 */
	setCropZone(x: number, y: number, width: number, height: number): this;

	/** The current focus point, in original image pixels. */
	getFocusPoint(): FocusPoint;

	/** The current crop zone, in original image pixels. */
	getCropZone(): CropZone;

	/** The image's intrinsic dimensions. */
	getImageDimensions(): ImageDimensions;

	/**
	 * Removes every element and listener the tool created. The instance is
	 * unusable afterwards; calling `destroy()` twice is safe.
	 */
	destroy(): void;
}
