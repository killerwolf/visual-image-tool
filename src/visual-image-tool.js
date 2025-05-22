/**
 * ImageTool - Un outil léger pour définir des points focaux et zones de recadrage sur des images
 * @module visual-image-tool
 */

class VisualImageTool {
	/**
	 * Crée une instance de l'outil d'image
	 * @param {Object} options - Options de configuration
	 * @param {HTMLElement|string} options.imageElement - Élément image ou sélecteur CSS
	 * @param {Object} [options.focusPoint] - Configuration du point focal
	 * @param {boolean} [options.focusPoint.enabled=true] - Activer la fonctionnalité de point focal
	 * @param {Object} [options.focusPoint.style] - Styles personnalisés pour le marqueur de point focal
	 * @param {Object} [options.cropZone] - Configuration de la zone de recadrage
	 * @param {boolean} [options.cropZone.enabled=true] - Activer la fonctionnalité de zone de recadrage
	 * @param {Object} [options.cropZone.style] - Styles personnalisés pour l'overlay de recadrage
	 * @param {Function} [options.onChange] - Callback appelé lors des changements
	 */
	constructor(options) {
		// Valider les options
		if (!options || !options.imageElement) {
			throw new Error("L'élément image est requis");
		}

		// Initialiser les propriétés
		this.imageElement =
			typeof options.imageElement === "string"
				? document.querySelector(options.imageElement)
				: options.imageElement;

		if (!this.imageElement || this.imageElement.tagName !== "IMG") {
			throw new Error("Élément image invalide");
		}

		// Options par défaut
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

		// État interne
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

		// Variables pour le suivi des interactions
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

		// Initialiser l'outil
		this._init();
	}

	/**
	 * Initialise l'outil d'image
	 * @private
	 */
	_init() {
		// Préparer le conteneur parent
		this._prepareContainer();

		// Initialiser les dimensions
		this._updateScaling();

		// Créer les éléments d'interface si activés
		if (this.options.focusPoint.enabled) {
			this._createFocusMarker();
		}

		if (this.options.cropZone.enabled) {
			this._createCropOverlay();
		}

		// Ajouter les écouteurs d'événements
		this._setupEventListeners();
	}

	/**
	 * Prépare le conteneur parent de l'image
	 * @private
	 */
	_prepareContainer() {
		// S'assurer que le parent est positionné
		if (this.imageElement.parentNode) {
			this.imageElement.parentNode.style.position = "relative";
		}
	}

	/**
	 * Met à jour les facteurs d'échelle
	 * @private
	 */
	_updateScaling() {
		this.state.originalWidth = this.imageElement.naturalWidth || 1;
		this.state.originalHeight = this.imageElement.naturalHeight || 1;
		this.state.displayWidth = this.imageElement.offsetWidth;
		this.state.displayHeight = this.imageElement.offsetHeight;
		this.state.scaleX = this.state.displayWidth / this.state.originalWidth;
		this.state.scaleY = this.state.displayHeight / this.state.originalHeight;

		// Repositionner les éléments si actifs
		if (this.state.focusActive) {
			this._updateFocusMarkerPosition();
		}

		if (this.state.cropActive) {
			this._updateCropOverlayPosition();
		}
	}

	/**
	 * Convertit des coordonnées d'affichage en coordonnées originales
	 * @private
	 * @param {number} scaledX - Coordonnée X à l'échelle d'affichage
	 * @param {number} scaledY - Coordonnée Y à l'échelle d'affichage
	 * @returns {Object} Coordonnées originales
	 */
	_toOriginalCoords(scaledX, scaledY) {
		return {
			x: scaledX / this.state.scaleX,
			y: scaledY / this.state.scaleY,
		};
	}

	/**
	 * Convertit des coordonnées originales en coordonnées d'affichage
	 * @private
	 * @param {number} originalX - Coordonnée X originale
	 * @param {number} originalY - Coordonnée Y originale
	 * @returns {Object} Coordonnées à l'échelle d'affichage
	 */
	_toScaledCoords(originalX, originalY) {
		return {
			x: originalX * this.state.scaleX,
			y: originalY * this.state.scaleY,
		};
	}

	/**
	 * Crée le marqueur de point focal
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

		// Ajouter les écouteurs d'événements au marqueur
		marker.addEventListener(
			"mousedown",
			this._handleFocusMarkerMouseDown.bind(this),
		);
	}

	/**
	 * Gère l'événement mousedown sur le marqueur de point focal
	 * @private
	 * @param {MouseEvent} e - Événement mousedown
	 */
	_handleFocusMarkerMouseDown(e) {
		this.interaction.focusDragging = true;
		this.state.focusMarker.style.cursor = "grabbing";

		// Calculer le décalage par rapport au centre du marqueur
		const rect = this.state.focusMarker.getBoundingClientRect();
		this.interaction.focusDragOffsetX =
			e.clientX - (rect.left + rect.width / 2);
		this.interaction.focusDragOffsetY =
			e.clientY - (rect.top + rect.height / 2);

		e.preventDefault();
	}

	/**
	 * Crée l'overlay de zone de recadrage
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

		// Ajouter les poignées de redimensionnement
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

			// Positionner la poignée
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

			// Ajouter l'écouteur d'événement
			handle.addEventListener("mousedown", (e) =>
				this._handleCropHandleMouseDown(e, handleType),
			);

			overlay.appendChild(handle);
		}

		// Ajouter l'écouteur pour le déplacement de l'overlay
		overlay.addEventListener(
			"mousedown",
			this._handleCropOverlayMouseDown.bind(this),
		);

		this.imageElement.parentNode.appendChild(overlay);
		this.state.cropOverlay = overlay;
	}

	/**
	 * Gère l'événement mousedown sur une poignée de redimensionnement
	 * @private
	 * @param {MouseEvent} e - Événement mousedown
	 * @param {string} handleType - Type de poignée
	 */
	_handleCropHandleMouseDown(e, handleType) {
		this.interaction.cropResizing = true;
		this.interaction.activeHandle = handleType;

		// Enregistrer les dimensions et position initiales
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
	 * Gère l'événement mousedown sur l'overlay de recadrage
	 * @private
	 * @param {MouseEvent} e - Événement mousedown
	 */
	_handleCropOverlayMouseDown(e) {
		// Ignorer si on clique sur une poignée
		if (e.target !== this.state.cropOverlay) return;

		this.interaction.cropDragging = true;
		this.state.cropOverlay.style.cursor = "grabbing";

		// Enregistrer la position initiale
		this.interaction.startX =
			Number.parseInt(this.state.cropOverlay.style.left, 10) || 0;
		this.interaction.startY =
			Number.parseInt(this.state.cropOverlay.style.top, 10) || 0;
		this.interaction.startMouseX = e.clientX;
		this.interaction.startMouseY = e.clientY;

		e.preventDefault();
	}

	/**
	 * Configure les écouteurs d'événements globaux
	 * @private
	 */
	_setupEventListeners() {
		// Écouteur pour le redimensionnement de la fenêtre
		window.addEventListener("resize", this._updateScaling.bind(this));

		// Écouteur pour le chargement de l'image
		if (!this.imageElement.complete) {
			this.imageElement.addEventListener(
				"load",
				this._updateScaling.bind(this),
			);
		}

		// Écouteurs pour les interactions de souris
		document.addEventListener("mouseup", this._handleMouseUp.bind(this));
		document.addEventListener("mousemove", this._handleMouseMove.bind(this));
	}

	/**
	 * Gère l'événement mouseup global
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
	 * Gère l'événement mousemove global
	 * @private
	 * @param {MouseEvent} e - Événement mousemove
	 */
	_handleMouseMove(e) {
		// Gestion du déplacement du point focal
		if (this.interaction.focusDragging && this.state.focusMarker) {
			this._handleFocusMarkerDrag(e);
		}

		// Gestion du déplacement de la zone de recadrage
		if (this.interaction.cropDragging) {
			this._handleCropOverlayDrag(e);
		}

		// Gestion du redimensionnement de la zone de recadrage
		if (this.interaction.cropResizing) {
			this._handleCropOverlayResize(e);
		}
	}

	/**
	 * Gère le déplacement du marqueur de point focal
	 * @private
	 * @param {MouseEvent} e - Événement mousemove
	 */
	_handleFocusMarkerDrag(e) {
		const imageRect = this.imageElement.getBoundingClientRect();

		// Calculer la position cible relative à l'image
		const targetScaledX =
			e.clientX - imageRect.left - this.interaction.focusDragOffsetX;
		const targetScaledY =
			e.clientY - imageRect.top - this.interaction.focusDragOffsetY;

		// Convertir en coordonnées originales
		const original = this._toOriginalCoords(targetScaledX, targetScaledY);

		// Mettre à jour le point focal
		this.setFocusPoint(original.x, original.y);
	}

	/**
	 * Gère le déplacement de l'overlay de recadrage
	 * @private
	 * @param {MouseEvent} e - Événement mousemove
	 */
	_handleCropOverlayDrag(e) {
		const deltaX = e.clientX - this.interaction.startMouseX;
		const deltaY = e.clientY - this.interaction.startMouseY;

		// Calculer la nouvelle position en pixels d'affichage
		const newX = this.interaction.startX + deltaX;
		const newY = this.interaction.startY + deltaY;

		// Convertir en coordonnées originales
		const original = this._toOriginalCoords(newX, newY);

		// Obtenir les dimensions actuelles en coordonnées originales
		const { width, height } = this.state.cropZone;

		// Mettre à jour la zone de recadrage
		this.setCropZone(original.x, original.y, width, height);
	}

	/**
	 * Gère le redimensionnement de l'overlay de recadrage
	 * @private
	 * @param {MouseEvent} e - Événement mousemove
	 */
	_handleCropOverlayResize(e) {
		if (!this.interaction.activeHandle) return;

		const deltaX = e.clientX - this.interaction.startMouseX;
		const deltaY = e.clientY - this.interaction.startMouseY;

		let newX = this.interaction.startX;
		let newY = this.interaction.startY;
		let newWidth = this.interaction.startWidth;
		let newHeight = this.interaction.startHeight;

		// Ajuster en fonction de la poignée active
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

		// Empêcher les dimensions négatives
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

		// Convertir les coordonnées d'affichage en coordonnées originales
		const originalX = newX / this.state.scaleX;
		const originalY = newY / this.state.scaleY;
		const originalWidth = newWidth / this.state.scaleX;
		const originalHeight = newHeight / this.state.scaleY;

		// Mettre à jour la zone de recadrage
		this.setCropZone(originalX, originalY, originalWidth, originalHeight);
	}

	/**
	 * Met à jour la position du marqueur de point focal
	 * @private
	 */
	_updateFocusMarkerPosition() {
		if (!this.state.focusMarker) return;

		const { x, y } = this.state.focusPoint;

		// Limiter les coordonnées aux dimensions de l'image
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth));
		const clampedY = Math.max(0, Math.min(y, this.state.originalHeight));

		// Mettre à jour l'état si les coordonnées ont été limitées
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

		// Ajuster pour centrer le marqueur
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
	 * Met à jour la position et les dimensions de l'overlay de recadrage
	 * @private
	 */
	_updateCropOverlayPosition() {
		if (!this.state.cropOverlay) return;

		const { x, y, width, height } = this.state.cropZone;

		// Limiter aux dimensions de l'image
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

		// Mettre à jour l'état si les valeurs ont été limitées
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

		// Convertir en coordonnées d'affichage
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

		// Mettre à jour l'overlay
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
	 * Active ou désactive le point focal
	 * @public
	 * @param {boolean} active - État d'activation
	 * @returns {ImageTool} Instance pour chaînage
	 */
	toggleFocusPoint(active) {
		if (!this.options.focusPoint.enabled) return this;

		const isActive = active === undefined ? !this.state.focusActive : active;

		if (isActive && !this.state.focusActive) {
			// Activer le point focal
			if (!this.state.focusMarker) {
				this._createFocusMarker();
			}

			// Positionner au centre de l'image par défaut si pas déjà défini
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
			// Désactiver le point focal
			if (this.state.focusMarker) {
				this.state.focusMarker.style.display = "none";
			}
			this.state.focusActive = false;
		}

		// Notifier le changement
		this._notifyChange();

		return this;
	}

	/**
	 * Active ou désactive la zone de recadrage
	 * @public
	 * @param {boolean} active - État d'activation
	 * @returns {ImageTool} Instance pour chaînage
	 */
	toggleCropZone(active) {
		if (!this.options.cropZone.enabled) return this;

		const isActive = active === undefined ? !this.state.cropActive : active;

		if (isActive && !this.state.cropActive) {
			// Activer la zone de recadrage
			if (!this.state.cropOverlay) {
				this._createCropOverlay();
			}

			// Définir une zone par défaut si pas déjà définie
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
			// Désactiver la zone de recadrage
			if (this.state.cropOverlay) {
				this.state.cropOverlay.style.display = "none";
			}
			this.state.cropActive = false;
		}

		// Notifier le changement
		this._notifyChange();

		return this;
	}

	/**
	 * Définit la position du point focal
	 * @public
	 * @param {number} x - Coordonnée X en pixels originaux
	 * @param {number} y - Coordonnée Y en pixels originaux
	 * @returns {ImageTool} Instance pour chaînage
	 */
	setFocusPoint(x, y) {
		// Limiter les coordonnées aux dimensions de l'image
		const clampedX = Math.max(0, Math.min(x, this.state.originalWidth));
		const clampedY = Math.max(0, Math.min(y, this.state.originalHeight));

		this.state.focusPoint = { x: clampedX, y: clampedY };

		if (this.state.focusActive && this.state.focusMarker) {
			this._updateFocusMarkerPosition();
		}

		// Notifier le changement
		this._notifyChange();

		return this;
	}

	/**
	 * Définit la position et les dimensions de la zone de recadrage
	 * @public
	 * @param {number} x - Coordonnée X en pixels originaux
	 * @param {number} y - Coordonnée Y en pixels originaux
	 * @param {number} width - Largeur en pixels originaux
	 * @param {number} height - Hauteur en pixels originaux
	 * @returns {ImageTool} Instance pour chaînage
	 */
	setCropZone(x, y, width, height) {
		// Limiter aux dimensions de l'image
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

		// Notifier le changement
		this._notifyChange();

		return this;
	}

	/**
	 * Obtient la position actuelle du point focal
	 * @public
	 * @returns {Object} Coordonnées du point focal {x, y}
	 */
	getFocusPoint() {
		return { ...this.state.focusPoint };
	}

	/**
	 * Obtient la position et les dimensions actuelles de la zone de recadrage
	 * @public
	 * @returns {Object} Zone de recadrage {x, y, width, height}
	 */
	getCropZone() {
		return { ...this.state.cropZone };
	}

	/**
	 * Obtient les dimensions originales de l'image
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
	 * Notifie les changements via le callback
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
	 * Détruit l'instance et nettoie les ressources
	 * @public
	 */
	destroy() {
		// Si déjà détruit, ne rien faire
		if (!this.state) {
			return;
		}

		// Supprimer les éléments DOM
		if (this.state.focusMarker?.parentNode) {
			this.state.focusMarker.parentNode.removeChild(this.state.focusMarker);
		}

		if (this.state.cropOverlay?.parentNode) {
			this.state.cropOverlay.parentNode.removeChild(this.state.cropOverlay);
		}

		// Supprimer les écouteurs d'événements
		window.removeEventListener("resize", this._updateScaling.bind(this));
		document.removeEventListener("mouseup", this._handleMouseUp.bind(this));
		document.removeEventListener("mousemove", this._handleMouseMove.bind(this));

		// Réinitialiser l'état
		this.state = null;
		this.interaction = null;
		this.options = null;
		this.imageElement = null;
	}
}

// Exporter la classe
export default VisualImageTool;
