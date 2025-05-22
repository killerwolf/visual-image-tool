/**
 * ImageTool - A lightweight tool for defining focus points and crop zones on images
 * @module visual-image-tool
 */

class VisualImageTool {
	/**
	 * Creates an instance of the image tool.
	 * The focus point is initialized to `{x:0, y:0}` in `this.state`. When `toggleFocusPoint(true)` is called for the first time, if the focus point is still `{x:0, y:0}`, it will be automatically centered on the image.
	 * @param {Object} options - Configuration options
	 * @param {HTMLElement|string} options.imageElement - Image element or CSS selector
	 * @param {Object} [options.focusPoint] - Focus point configuration
	 * @param {boolean} [options.focusPoint.enabled=true] - Enable focus point functionality
	 * @param {Object} [options.focusPoint.style] - Custom styles for the focus point marker
	 * @param {Object} [options.cropZone] - Crop zone configuration
	 * @param {boolean} [options.cropZone.enabled=true] - Enable crop zone functionality
	 * @param {Object} [options.cropZone.style] - Custom styles for the crop overlay
	 * @param {Function} [options.onChange] - Callback called on changes
	 */
	constructor(options) {
		// Validate options
		if (!options || !options.imageElement) {
			throw new Error("Image element is required");
		}

		// Initialize properties
		this.imageElement =
			typeof options.imageElement === "string"
				? document.querySelector(options.imageElement)
				: options.imageElement;

		if (!this.imageElement || this.imageElement.tagName !== "IMG") {
			throw new Error("Invalid image element");
		}

		// Default options
		this.options = {
			focusPoint: {
				enabled: true,
				style: {
					width: "30px",
					height: "30px",
					border: "3px solid white",
					boxShadow: "0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)",
					backgroundColor: "rgba(255, 0, 0, 0.5)",
				},
				...options.focusPoint,
			},
			cropZone: {
				enabled: true,
				style: {
					border: "1px dashed #fff",
					backgroundColor: "rgba(0, 0, 0, 0.4)",
				},
				handleStyle: {
					width: "14px",
					height: "14px",
					backgroundColor: "white",
					border: "2px solid black",
					boxShadow: "0 0 3px rgba(0,0,0,0.5)",
				},
				...options.cropZone,
			},
			onChange: options.onChange || (() => {}),
			debug: options.debug || false,
		};

		// Internal state
		this.state = {
			focusMarker: null,
			cropOverlay: null,
			focusActive: false,
			cropActive: false,
			focusPoint: { x: 0, y: 0 },
			cropZone: { x: 0, y: 0, width: 0, height: 0 },
			originalWidth: 1,
			originalHeight: 1,
			displayWidth: 1,
			displayHeight: 1,
			scaleX: 1,
			scaleY: 1,
		};

		// Variables for tracking interactions
		this.interaction = {
			focusDragging: false,
			focusDragOffsetX: 0,
			focusDragOffsetY: 0,
			cropDragging: false,
			cropResizing: false,
			activeHandle: null,
			startX: 0,
			startY: 0,
			startWidth: 0,
			startHeight: 0,
			startMouseX: 0,
			startMouseY: 0,
		};

		// Initialize the tool
		this._init();
	}

	/**
	 * Initializes the image tool
	 * @private
	 */
	_init() {
		// Prepare the parent container
		this._prepareContainer();

		// Initialize dimensions
		this._updateScaling();

		// Create UI elements if enabled
		if (this.options.focusPoint.enabled) {
			this._createFocusMarker();
		}

		if (this.options.cropZone.enabled) {
			this._createCropOverlay();
		}

		// Add event listeners
		this._setupEventListeners();
	}

	/**
	 * Prepares the image's parent container
	 * @private
	 */
	_prepareContainer() {
		// Ensure the parent is positioned
		if (this.imageElement.parentNode) {
			this.imageElement.parentNode.style.position = "relative";
		}
	}

	/**
	 * Updates scaling factors
	 * @private
	 */
	_updateScaling() {
		this.state.originalWidth = this.imageElement.naturalWidth || 1;
		this.state.originalHeight = this.imageElement.naturalHeight || 1;
		this.state.displayWidth = this.imageElement.offsetWidth;
		this.state.displayHeight = this.imageElement.offsetHeight;
		this.state.scaleX = this.state.displayWidth / this.state.originalWidth;
		this.state.scaleY = this.state.displayHeight / this.state.originalHeight;

		// Reposition elements if active
		if (this.state.focusActive) {
			this._updateFocusMarkerPosition();
		}

		if (this.state.cropActive) {
			this._updateCropOverlayPosition();
		}
	}

	/**
	 * Converts display coordinates to original coordinates
	 * @private
	 * @param {number} scaledX - X-coordinate at display scale
	 * @param {number} scaledY - Y-coordinate at display scale
	 * @returns {Object} Original coordinates {x, y}
	 */
	_toOriginalCoords(scaledX, scaledY) {
		return {
			x: scaledX / this.state.scaleX,
			y: scaledY / this.state.scaleY,
		};
	}

	/**
	 * Converts original coordinates to display coordinates
	 * @private
	 * @param {number} originalX - Original X-coordinate
	 * @param {number} originalY - Original Y-coordinate
	 * @returns {Object} Display scale coordinates {x, y}
	 */
	_toScaledCoords(originalX, originalY) {
		return {
			x: originalX * this.state.scaleX,
			y: originalY * this.state.scaleY,
		};
	}

	/**
	 * Creates the focus point marker
	 * @private
	 */
	_createFocusMarker() {
		if (this.state.focusMarker) return;

		const marker = document.createElement("div");
		marker.style.position = "absolute";
		marker.style.width = this.options.focusPoint.style.width;
		marker.style.height = this.options.focusPoint.style.height;
		marker.style.border = this.options.focusPoint.style.border;
		marker.style.boxShadow = this.options.focusPoint.style.boxShadow;
		marker.style.backgroundColor =
			this.options.focusPoint.style.backgroundColor;
		marker.style.cursor = "move";
		marker.style.display = "none";
		marker.style.zIndex = "999";
		marker.style.clipPath =
			"polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)";

		this.imageElement.parentNode.appendChild(marker);
		this.state.focusMarker = marker;

		// Add event listeners to the marker
		marker.addEventListener(
			"mousedown",
			this._handleFocusMarkerMouseDown.bind(this),
		);
	}

	/**
	 * Handles mousedown event on the focus point marker
	 * @private
	 * @param {MouseEvent} e - Mousedown event
	 */
	_handleFocusMarkerMouseDown(e) {
		this.interaction.focusDragging = true;
		this.state.focusMarker.style.cursor = "grabbing";

		// Calculate offset from marker center
		const rect = this.state.focusMarker.getBoundingClientRect();
		this.interaction.focusDragOffsetX =
			e.clientX - (rect.left + rect.width / 2);
		this.interaction.focusDragOffsetY =
			e.clientY - (rect.top + rect.height / 2);

		e.preventDefault();
	}

	/**
	 * Creates the crop zone overlay
	 * @private
	 */
	_createCropOverlay() {
		if (this.state.cropOverlay) return;

		const overlay = document.createElement("div");
		overlay.style.position = "absolute";
		overlay.style.border = this.options.cropZone.style.border;
		overlay.style.backgroundColor = this.options.cropZone.style.backgroundColor;
		overlay.style.boxSizing = "border-box";
		overlay.style.cursor = "move";
		overlay.style.display = "none";
		overlay.style.zIndex = "998";

		// Add resize handles
		const handles = ["tl", "tm", "tr", "ml", "mr", "bl", "bm", "br"];
		for (const handleType of handles) {
			const handle = document.createElement("div");
			handle.style.position = "absolute";
			handle.style.width = this.options.cropZone.handleStyle.width;
			handle.style.height = this.options.cropZone.handleStyle.height;
			handle.style.backgroundColor =
				this.options.cropZone.handleStyle.backgroundColor;
			handle.style.border = this.options.cropZone.handleStyle.border;
			handle.style.boxShadow = this.options.cropZone.handleStyle.boxShadow;
			handle.style.boxSizing = "border-box";
			handle.dataset.handle = handleType;

			// Position the handle
			switch (handleType) {
				case "tl": // Top-left
					handle.style.top = "-7px";
					handle.style.left = "-7px";
					handle.style.cursor = "nwse-resize";
					break;
				case "tm": // Top-middle
					handle.style.top = "-7px";
					handle.style.left = "50%";
					handle.style.marginLeft = "-7px";
					handle.style.cursor = "ns-resize";
					break;
				case "tr": // Top-right
					handle.style.top = "-7px";
					handle.style.right = "-7px";
					handle.style.cursor = "nesw-resize";
					break;
				case "ml": // Middle-left
					handle.style.top = "50%";
					handle.style.left = "-7px";
					handle.style.marginTop = "-7px";
					handle.style.cursor = "ew-resize";
					break;
				case "mr": // Middle-right
					handle.style.top = "50%";
					handle.style.right = "-7px";
					handle.style.marginTop = "-7px";
					handle.style.cursor = "ew-resize";
					break;
				case "bl": // Bottom-left
					handle.style.bottom = "-7px";
					handle.style.left = "-7px";
					handle.style.cursor = "nesw-resize";
					break;
				case "bm": // Bottom-middle
					handle.style.bottom = "-7px";
					handle.style.left = "50%";
					handle.style.marginLeft = "-7px";
					handle.style.cursor = "ns-resize";
					break;
				case "br": // Bottom-right
					handle.style.bottom = "-7px";
					handle.style.right = "-7px";
					handle.style.cursor = "nwse-resize";
					break;
			}

			// Add event listener
			handle.addEventListener("mousedown", (e) =>
				this._handleCropHandleMouseDown(e, handleType),
			);

			overlay.appendChild(handle);
		}

		// Add listener for overlay dragging
		overlay.addEventListener(
			"mousedown",
			this._handleCropOverlayMouseDown.bind(this),
		);

		this.imageElement.parentNode.appendChild(overlay);
		this.state.cropOverlay = overlay;
	}

	/**
	 * Handles mousedown event on a resize handle
	 * @private
	 * @param {MouseEvent} e - Mousedown event
	 * @param {string} handleType - Handle type
	 */
	_handleCropHandleMouseDown(e, handleType) {
		this.interaction.cropResizing = true;
		this.interaction.activeHandle = handleType;

		// Record initial dimensions and position
		this.interaction.startX =
			Number.parseInt(this.state.cropOverlay.style.left, 10) || 0;
		this.interaction.startY =
			Number.parseInt(this.state.cropOverlay.style.top, 10) || 0;
		this.interaction.startWidth = this.state.cropOverlay.offsetWidth;
		this.interaction.startHeight = this.state.cropOverlay.offsetHeight;
		this.interaction.startMouseX = e.clientX;
		this.interaction.startMouseY = e.clientY;

		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * Handles mousedown event on the crop overlay
	 * @private
	 * @param {MouseEvent} e - Mousedown event
	 */
	_handleCropOverlayMouseDown(e) {
		// Ignore if clicking on a handle
		if (e.target !== this.state.cropOverlay) return;

		this.interaction.cropDragging = true;
		this.state.cropOverlay.style.cursor = "grabbing";

		// Record initial position
		this.interaction.startX =
			Number.parseInt(this.state.cropOverlay.style.left, 10) || 0;
		this.interaction.startY =
			Number.parseInt(this.state.cropOverlay.style.top, 10) || 0;
		this.interaction.startMouseX = e.clientX;
		this.interaction.startMouseY = e.clientY;

		e.preventDefault();
	}

	/**
	 * Sets up global event listeners
	 * @private
	 */
	_setupEventListeners() {
		// Listener for window resize
		window.addEventListener("resize", this._updateScaling.bind(this));

		// Listener for image load
		if (!this.imageElement.complete) {
			this.imageElement.addEventListener(
				"load",
				this._updateScaling.bind(this),
			);
		}

		// Listeners for mouse interactions
		document.addEventListener("mouseup", this._handleMouseUp.bind(this));
		document.addEventListener("mousemove", this._handleMouseMove.bind(this));
	}

	/**
	 * Handles global mouseup event
	 * @private
	 */
	_handleMouseUp() {
		if (this.interaction.focusDragging) {
			this.interaction.focusDragging = false;
			if (this.state.focusMarker) this.state.focusMarker.style.cursor = "move";
		}

		if (this.interaction.cropDragging) {
			this.interaction.cropDragging = false;
			if (this.state.cropOverlay) this.state.cropOverlay.style.cursor = "move";
		}

		this.interaction.cropResizing = false;
		this.interaction.activeHandle = null;
		document.body.style.cursor = "default";
	}

	/**
	 * Handles global mousemove event
	 * @private
	 * @param {MouseEvent} e - Mousemove event
	 */
	_handleMouseMove(e) {
		// Handle focus point dragging
		if (this.interaction.focusDragging && this.state.focusMarker) {
			this._handleFocusMarkerDrag(e);
		}

		// Handle crop zone dragging
		if (this.interaction.cropDragging) {
			this._handleCropOverlayDrag(e);
		}

		// Handle crop zone resizing
		if (this.interaction.cropResizing) {
			this._handleCropOverlayResize(e);
		}
	}

	/**
	 * Handles focus point marker drag
	 * @private
	 * @param {MouseEvent} e - Mousemove event
	 */
	_handleFocusMarkerDrag(e) {
		const imageRect = this.imageElement.getBoundingClientRect();

		// Calculate target position relative to the image
		const targetScaledX =
			e.clientX - imageRect.left - this.interaction.focusDragOffsetX;
		const targetScaledY =
			e.clientY - imageRect.top - this.interaction.focusDragOffsetY;

		// Convert to original coordinates
		const original = this._toOriginalCoords(targetScaledX, targetScaledY);

		// Update focus point
		this.setFocusPoint(original.x, original.y);
	}

	/**
	 * Handles crop overlay drag
	 * @private
	 * @param {MouseEvent} e - Mousemove event
	 */
	_handleCropOverlayDrag(e) {
		const deltaX = e.clientX - this.interaction.startMouseX;
		const deltaY = e.clientY - this.interaction.startMouseY;

		// Calculate new position in display pixels
		const newX = this.interaction.startX + deltaX;
		const newY = this.interaction.startY + deltaY;

		// Convert to original coordinates
		const original = this._toOriginalCoords(newX, newY);

		// Get current dimensions in original coordinates
		const { width, height } = this.state.cropZone;

		// Update crop zone
		this.setCropZone(original.x, original.y, width, height);
	}

	/**
	 * Handles crop overlay resize
	 * @private
	 * @param {MouseEvent} e - Mousemove event
	 */
	_handleCropOverlayResize(e) {
		if (!this.interaction.activeHandle) return;

		const deltaX = e.clientX - this.interaction.startMouseX;
		const deltaY = e.clientY - this.interaction.startMouseY;

		let newX = this.interaction.startX;
		let newY = this.interaction.startY;
		let newWidth = this.interaction.startWidth;
		let newHeight = this.interaction.startHeight;

		// Adjust based on active handle
		if (this.interaction.activeHandle.includes("t")) {
			// Top
			newY = this.interaction.startY + deltaY;
			newHeight = this.interaction.startHeight - deltaY;
		}
		if (this.interaction.activeHandle.includes("b")) {
			// Bottom
			newHeight = this.interaction.startHeight + deltaY;
		}
		if (this.interaction.activeHandle.includes("l")) {
			// Left
			newX = this.interaction.startX + deltaX;
			newWidth = this.interaction.startWidth - deltaX;
		}
		if (this.interaction.activeHandle.includes("r")) {
			// Right
			newWidth = this.interaction.startWidth + deltaX;
		}

		// Prevent negative dimensions
		if (newWidth < 10) {
			if (this.interaction.activeHandle.includes("l")) {
				newX = this.interaction.startX + this.interaction.startWidth - 10;
			}
			newWidth = 10;
		}
		if (newHeight < 10) {
			if (this.interaction.activeHandle.includes("t")) {
				newY = this.interaction.startY + this.interaction.startHeight - 10;
			}
			newHeight = 10;
		}

		// Convert display coordinates to original coordinates
		const originalX = newX / this.state.scaleX;
		const originalY = newY / this.state.scaleY;
		const originalWidth = newWidth / this.state.scaleX;
		const originalHeight = newHeight / this.state.scaleY;

		// Update crop zone
		this.setCropZone(originalX, originalY, originalWidth, originalHeight);
	}

	/**
	 * Updates the focus point marker position
	 * @private
	 */
	_updateFocusMarkerPosition() {
		if (!this.state.focusMarker) return;

		const { x, y } = this.state.focusPoint;

		// Clamp coordinates to image dimensions
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth));
		const clampedY = Math.max(0, Math.min(y, this.state.originalHeight));

		// Update state if coordinates were clamped
		if (x !== clampedX || y !== clampedY) {
			this.state.focusPoint = { x: clampedX, y: clampedY };
		}

		const scaled = this._toScaledCoords(clampedX, clampedY);

		// LOGGING: Validate padding offset
		if (this.options.debug) {
			const container = this.imageElement.parentNode;
			const computedStyle = window.getComputedStyle(container);
			const paddingLeft = Number.parseFloat(computedStyle.paddingLeft);
			const paddingTop = Number.parseFloat(computedStyle.paddingTop);
			console.log(
				"[FocusMarker] scaled:",
				scaled,
				"paddingLeft:",
				paddingLeft,
				"paddingTop:",
				paddingTop,
				"containerRect:",
				container.getBoundingClientRect(),
			);
		}

		// Adjust to center the marker
		// Adjust for container padding (use unique variable names)
		let focusPaddingLeft = 0;
		let focusPaddingTop = 0;
		{
			const container = this.imageElement.parentNode;
			const computedStyle = window.getComputedStyle(container);
			focusPaddingLeft = Number.parseFloat(computedStyle.paddingLeft);
			focusPaddingTop = Number.parseFloat(computedStyle.paddingTop);
		}

		this.state.focusMarker.style.left = `${
			scaled.x + focusPaddingLeft - this.state.focusMarker.offsetWidth / 2
		}px`;
		this.state.focusMarker.style.top = `${
			scaled.y + focusPaddingTop - this.state.focusMarker.offsetHeight / 2
		}px`;
		if (this.options.debug) {
			console.log(
				"[FocusMarker] style.left:",
				this.state.focusMarker.style.left,
				"style.top:",
				this.state.focusMarker.style.top,
			);
		}
	}

	/**
	 * Updates the crop overlay position and dimensions
	 * @private
	 */
	_updateCropOverlayPosition() {
		if (!this.state.cropOverlay) return;

		const { x, y, width, height } = this.state.cropZone;

		// Clamp to image dimensions
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth - width));
		const clampedY = Math.max(
			0,
			Math.min(y, this.state.originalHeight - height),
		);
		const clampedWidth = Math.max(
			10,
			Math.min(width, this.state.originalWidth - clampedX),
		);
		const clampedHeight = Math.max(
			10,
			Math.min(height, this.state.originalHeight - clampedY),
		);

		// Update state if values were clamped
		if (
			x !== clampedX ||
			y !== clampedY ||
			width !== clampedWidth ||
			height !== clampedHeight
		) {
			this.state.cropZone = {
				x: clampedX,
				y: clampedY,
				width: clampedWidth,
				height: clampedHeight,
			};
		}

		// Convert to display coordinates
		const scaled = this._toScaledCoords(clampedX, clampedY);
		const scaledWidth = clampedWidth * this.state.scaleX;
		const scaledHeight = clampedHeight * this.state.scaleY;

		// LOGGING: Validate padding offset
		if (this.options.debug) {
			const container = this.imageElement.parentNode;
			const computedStyle = window.getComputedStyle(container);
			const paddingLeft = Number.parseFloat(computedStyle.paddingLeft);
			const paddingTop = Number.parseFloat(computedStyle.paddingTop);
			console.log(
				"[CropOverlay] scaled:",
				scaled,
				"paddingLeft:",
				paddingLeft,
				"paddingTop:",
				paddingTop,
				"containerRect:",
				container.getBoundingClientRect(),
			);
		}

		// Update overlay
		// Adjust for container padding (use unique variable names)
		let cropPaddingLeft = 0;
		let cropPaddingTop = 0;
		{
			const container = this.imageElement.parentNode;
			const computedStyle = window.getComputedStyle(container);
			cropPaddingLeft = Number.parseFloat(computedStyle.paddingLeft);
			cropPaddingTop = Number.parseFloat(computedStyle.paddingTop);
		}

		this.state.cropOverlay.style.left = `${scaled.x + cropPaddingLeft}px`;
		this.state.cropOverlay.style.top = `${scaled.y + cropPaddingTop}px`;
		this.state.cropOverlay.style.width = `${scaledWidth}px`;
		this.state.cropOverlay.style.height = `${scaledHeight}px`;
		if (this.options.debug) {
			console.log(
				"[CropOverlay] style.left:",
				this.state.cropOverlay.style.left,
				"style.top:",
				this.state.cropOverlay.style.top,
			);
		}
	}

	/**
	 * Enables or disables the focus point.
	 * If the focus point is at its initial state `{x:0, y:0}` (top-left corner), it will be moved to the center of the image when this method is called with `active = true` for the first time.
	 * @public
	 * @param {boolean} active - Activation state
	 * @returns {VisualImageTool} Instance for chaining
	 */
	toggleFocusPoint(active) {
		if (!this.options.focusPoint.enabled) return this;

		const isActive = active === undefined ? !this.state.focusActive : active;

		if (isActive && !this.state.focusActive) {
			// Enable focus point
			if (!this.state.focusMarker) {
				this._createFocusMarker();
			}

			// Position at image center by default if not already set
			if (this.state.focusPoint.x === 0 && this.state.focusPoint.y === 0) {
				this.state.focusPoint = {
					x: this.state.originalWidth / 2,
					y: this.state.originalHeight / 2,
				};
			}

			this._updateFocusMarkerPosition();
			this.state.focusMarker.style.display = "block";
			this.state.focusActive = true;
		} else if (!isActive && this.state.focusActive) {
			// Disable focus point
			if (this.state.focusMarker) {
				this.state.focusMarker.style.display = "none";
			}
			this.state.focusActive = false;
		}

		// Notify change
		this._notifyChange();

		return this;
	}

	/**
	 * Enables or disables the crop zone
	 * @public
	 * @param {boolean} active - Activation state
	 * @returns {VisualImageTool} Instance for chaining
	 */
	toggleCropZone(active) {
		if (!this.options.cropZone.enabled) return this;

		const isActive = active === undefined ? !this.state.cropActive : active;

		if (isActive && !this.state.cropActive) {
			// Enable crop zone
			if (!this.state.cropOverlay) {
				this._createCropOverlay();
			}

			// Define a default zone if not already set
			if (this.state.cropZone.width === 0 || this.state.cropZone.height === 0) {
				const defaultWidth = this.state.originalWidth / 2;
				const defaultHeight = this.state.originalHeight / 2;
				const defaultX = (this.state.originalWidth - defaultWidth) / 2;
				const defaultY = (this.state.originalHeight - defaultHeight) / 2;

				this.state.cropZone = {
					x: defaultX,
					y: defaultY,
					width: defaultWidth,
					height: defaultHeight,
				};
			}

			this._updateCropOverlayPosition();
			this.state.cropOverlay.style.display = "block";
			this.state.cropActive = true;
		} else if (!isActive && this.state.cropActive) {
			// Disable crop zone
			if (this.state.cropOverlay) {
				this.state.cropOverlay.style.display = "none";
			}
			this.state.cropActive = false;
		}

		// Notify change
		this._notifyChange();

		return this;
	}

	/**
	 * Sets the focus point position
	 * @public
	 * @param {number} x - X-coordinate in original pixels
	 * @param {number} y - Y-coordinate in original pixels
	 * @returns {VisualImageTool} Instance for chaining
	 */
	setFocusPoint(x, y) {
		// Clamp coordinates to image dimensions
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth));
		const clampedY = Math.max(0, Math.min(y, this.state.originalHeight));

		this.state.focusPoint = { x: clampedX, y: clampedY };

		if (this.state.focusActive && this.state.focusMarker) {
			this._updateFocusMarkerPosition();
		}

		// Notify change
		this._notifyChange();

		return this;
	}

	/**
	 * Sets the crop zone position and dimensions
	 * @public
	 * @param {number} x - X-coordinate in original pixels
	 * @param {number} y - Y-coordinate in original pixels
	 * @param {number} width - Width in original pixels
	 * @param {number} height - Height in original pixels
	 * @returns {VisualImageTool} Instance for chaining
	 */
	setCropZone(x, y, width, height) {
		// Clamp to image dimensions
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth - width));
		const clampedY = Math.max(
			0,
			Math.min(y, this.state.originalHeight - height),
		);
		const clampedWidth = Math.max(
			10,
			Math.min(width, this.state.originalWidth - clampedX),
		);
		const clampedHeight = Math.max(
			10,
			Math.min(height, this.state.originalHeight - clampedY),
		);

		this.state.cropZone = {
			x: clampedX,
			y: clampedY,
			width: clampedWidth,
			height: clampedHeight,
		};

		if (this.state.cropActive && this.state.cropOverlay) {
			this._updateCropOverlayPosition();
		}

		// Notify change
		this._notifyChange();

		return this;
	}

	/**
	 * Gets the current focus point position
	 * @public
	 * @returns {Object} Focus point coordinates {x, y}
	 */
	getFocusPoint() {
		return { ...this.state.focusPoint };
	}

	/**
	 * Gets the current crop zone position and dimensions
	 * @public
	 * @returns {Object} Crop zone {x, y, width, height}
	 */
	getCropZone() {
		return { ...this.state.cropZone };
	}

	/**
	 * Gets the original image dimensions
	 * @public
	 * @returns {Object} Dimensions {width, height}
	 */
	getImageDimensions() {
		return {
			width: this.state.originalWidth,
			height: this.state.originalHeight,
		};
	}

	/**
	 * Notifies changes via callback
	 * @private
	 */
	_notifyChange() {
		if (typeof this.options.onChange === "function") {
			this.options.onChange({
				focusPoint: this.getFocusPoint(),
				cropZone: this.getCropZone(),
				focusActive: this.state.focusActive,
				cropActive: this.state.cropActive,
			});
		}
	}

	/**
	 * Destroys the instance and cleans up resources
	 * @public
	 */
	destroy() {
		// Remove DOM elements
		if (this.state.focusMarker?.parentNode) {
			this.state.focusMarker.parentNode.removeChild(this.state.focusMarker);
		}

		if (this.state.cropOverlay?.parentNode) {
			this.state.cropOverlay.parentNode.removeChild(this.state.cropOverlay);
		}

		// Remove event listeners
		window.removeEventListener("resize", this._updateScaling.bind(this));
		document.removeEventListener("mouseup", this._handleMouseUp.bind(this));
		document.removeEventListener("mousemove", this._handleMouseMove.bind(this));

		// Reset state
		this.state = null;
		this.interaction = null;
		this.options = null;
		this.imageElement = null;
	}
}

// Export class
export default VisualImageTool;
