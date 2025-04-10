document.addEventListener('DOMContentLoaded', () => {
    // Éléments DOM
    const image = document.getElementById('cropit');
    const addCropZoneBtn = document.getElementById('addCropZone');
    const addFocusPointBtn = document.getElementById('addFocusPoint');
    const cropZoneDiv = document.getElementById('cropzone');
    const focusZoneDiv = document.getElementById('focuszone');
    const focusXInput = document.getElementById('focusX');
    const focusYInput = document.getElementById('focusY');
    const cropXInput = document.getElementById('cx');
    const cropYInput = document.getElementById('cy');
    const cropWInput = document.getElementById('cw');
    const cropHInput = document.getElementById('ch');
    
    // Variables globales
    let focusMarker = null;
    let cropOverlay = null;
    let cropActive = false;
    let focusActive = false;
    let focusDragging = false;
    let focusDragOffsetX = 0;
    let focusDragOffsetY = 0;
    let cropDragging = false;
    let cropResizing = false;
    let activeHandle = null;
    let startX, startY, startWidth, startHeight, startMouseX, startMouseY;

    // Dimensions et échelles
    let originalWidth = 1;
    let originalHeight = 1;
    let displayWidth = 1;
    let displayHeight = 1;
    let scaleX = 1;
    let scaleY = 1;

    // Mise à jour des facteurs d'échelle
    function updateScaling() {
        originalWidth = image.naturalWidth || 1;
        originalHeight = image.naturalHeight || 1;
        displayWidth = image.offsetWidth;
        displayHeight = image.offsetHeight;
        scaleX = displayWidth / originalWidth;
        scaleY = displayHeight / originalHeight;
        
        // Repositionner le marqueur si actif après redimensionnement
        if (focusActive) {
            const currentOriginalX = parseInt(focusXInput.value, 10);
            const currentOriginalY = parseInt(focusYInput.value, 10);
            if (!isNaN(currentOriginalX) && !isNaN(currentOriginalY)) {
                moveMarker(currentOriginalX, currentOriginalY);
            }
        }
        
        // Repositionner la zone de recadrage si active
        if (cropActive && cropOverlay) {
            updateCropOverlay();
        }
    }

    // Conversion des coordonnées
    function toOriginalCoords(scaledX, scaledY) {
        return { x: scaledX / scaleX, y: scaledY / scaleY };
    }

    function toScaledCoords(originalX, originalY) {
        return { x: originalX * scaleX, y: originalY * scaleY };
    }

    // ===== FONCTIONNALITÉ DE POINT FOCAL =====
    
    // Mise à jour des champs de saisie du point focal
    function updateFocusInputs(originalX, originalY) {
        focusXInput.value = Math.round(originalX);
        focusYInput.value = Math.round(originalY);
    }

    // Déplacement du marqueur de point focal
    function moveMarker(originalX, originalY) {
        if (!focusMarker) return;
        
        // Limiter les coordonnées aux dimensions de l'image
        const clampedX = Math.max(0, Math.min(originalX, originalWidth));
        const clampedY = Math.max(0, Math.min(originalY, originalHeight));
        
        const scaled = toScaledCoords(clampedX, clampedY);
        // Ajuster pour centrer le marqueur
        focusMarker.style.left = (scaled.x - focusMarker.offsetWidth / 2) + 'px';
        focusMarker.style.top = (scaled.y - focusMarker.offsetHeight / 2) + 'px';
        updateFocusInputs(clampedX, clampedY);
    }

    // Activation/désactivation du point focal
    function toggleFocusPoint() {
        if (!focusActive) {
            // Créer le marqueur s'il n'existe pas
            if (!focusMarker) {
                focusMarker = document.createElement('div');
                focusMarker.id = 'focus-marker';
                // Amélioration de la visibilité du marqueur
                focusMarker.style.width = '30px';
                focusMarker.style.height = '30px';
                focusMarker.style.border = '3px solid white';
                focusMarker.style.boxShadow = '0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)';
                focusMarker.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                image.parentNode.appendChild(focusMarker);
                
                // Ajouter les écouteurs d'événements au marqueur
                focusMarker.addEventListener('mousedown', (e) => {
                    focusDragging = true;
                    focusMarker.style.cursor = 'grabbing';
                    
                    // Calculer le décalage par rapport au centre du marqueur
                    const rect = focusMarker.getBoundingClientRect();
                    focusDragOffsetX = e.clientX - (rect.left + rect.width / 2);
                    focusDragOffsetY = e.clientY - (rect.top + rect.height / 2);
                    e.preventDefault();
                });
            }
            
            // Positionner au centre de l'image par défaut
            const centerX = originalWidth / 2;
            const centerY = originalHeight / 2;
            moveMarker(centerX, centerY);
            
            focusMarker.style.display = 'block';
            focusZoneDiv.classList.remove('hidden');
            addFocusPointBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler Point Focal
            `;
            addFocusPointBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            addFocusPointBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            focusActive = true;
        } else {
            // Désactiver le point focal
            focusMarker.style.display = 'none';
            focusZoneDiv.classList.add('hidden');
            focusXInput.value = '';
            focusYInput.value = '';
            addFocusPointBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                Ajouter Point Focal
            `;
            addFocusPointBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            addFocusPointBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            focusActive = false;
        }
    }

    // ===== FONCTIONNALITÉ DE ZONE DE RECADRAGE =====
    
    // Mise à jour des champs de saisie de la zone de recadrage
    function updateCropInputs(x, y, width, height) {
        cropXInput.value = Math.round(x);
        cropYInput.value = Math.round(y);
        cropWInput.value = Math.round(width);
        cropHInput.value = Math.round(height);
    }
    
    // Mise à jour de l'overlay de recadrage
    function updateCropOverlay() {
        if (!cropOverlay) return;
        
        const x = parseInt(cropXInput.value, 10);
        const y = parseInt(cropYInput.value, 10);
        const width = parseInt(cropWInput.value, 10);
        const height = parseInt(cropHInput.value, 10);
        
        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return;
        
        // Limiter aux dimensions de l'image
        const clampedX = Math.max(0, Math.min(x, originalWidth - width));
        const clampedY = Math.max(0, Math.min(y, originalHeight - height));
        const clampedWidth = Math.max(10, Math.min(width, originalWidth - clampedX));
        const clampedHeight = Math.max(10, Math.min(height, originalHeight - clampedY));
        
        // Convertir en coordonnées d'affichage
        const scaled = toScaledCoords(clampedX, clampedY);
        const scaledWidth = clampedWidth * scaleX;
        const scaledHeight = clampedHeight * scaleY;
        
        // Mettre à jour l'overlay
        cropOverlay.style.left = scaled.x + 'px';
        cropOverlay.style.top = scaled.y + 'px';
        cropOverlay.style.width = scaledWidth + 'px';
        cropOverlay.style.height = scaledHeight + 'px';
        
        // Mettre à jour les champs si les valeurs ont été limitées
        if (x !== clampedX || y !== clampedY || width !== clampedWidth || height !== clampedHeight) {
            updateCropInputs(clampedX, clampedY, clampedWidth, clampedHeight);
        }
    }
    
    // Activation/désactivation de la zone de recadrage
    function toggleCropZone() {
        if (!cropActive) {
            // Créer l'overlay s'il n'existe pas
            if (!cropOverlay) {
                cropOverlay = document.createElement('div');
                cropOverlay.id = 'crop-overlay';
                
                // Ajouter les poignées de redimensionnement
                const handles = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'];
                handles.forEach(handleType => {
                    const handle = document.createElement('div');
                    handle.classList.add('crop-handle', `handle-${handleType}`);
                    handle.dataset.handle = handleType;
                    
                    // Amélioration de la visibilité des poignées
                    handle.style.width = '14px';
                    handle.style.height = '14px';
                    handle.style.backgroundColor = 'white';
                    handle.style.border = '2px solid black';
                    handle.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
                    
                    // Ajouter les écouteurs d'événements pour les poignées
                    handle.addEventListener('mousedown', (e) => {
                        cropResizing = true;
                        activeHandle = handleType;
                        
                        // Enregistrer les dimensions et position initiales
                        startX = parseInt(cropOverlay.style.left, 10) || 0;
                        startY = parseInt(cropOverlay.style.top, 10) || 0;
                        startWidth = cropOverlay.offsetWidth;
                        startHeight = cropOverlay.offsetHeight;
                        startMouseX = e.clientX;
                        startMouseY = e.clientY;
                        
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    
                    cropOverlay.appendChild(handle);
                });
                
                // Ajouter l'écouteur pour le déplacement de l'overlay
                cropOverlay.addEventListener('mousedown', (e) => {
                    // Ignorer si on clique sur une poignée
                    if (e.target !== cropOverlay) return;
                    
                    cropDragging = true;
                    cropOverlay.style.cursor = 'grabbing';
                    
                    // Enregistrer la position initiale
                    startX = parseInt(cropOverlay.style.left, 10) || 0;
                    startY = parseInt(cropOverlay.style.top, 10) || 0;
                    startMouseX = e.clientX;
                    startMouseY = e.clientY;
                    
                    e.preventDefault();
                });
                
                image.parentNode.appendChild(cropOverlay);
            }
            
            // Définir une zone de recadrage par défaut (50% de l'image)
            const defaultWidth = originalWidth / 2;
            const defaultHeight = originalHeight / 2;
            const defaultX = (originalWidth - defaultWidth) / 2;
            const defaultY = (originalHeight - defaultHeight) / 2;
            
            updateCropInputs(defaultX, defaultY, defaultWidth, defaultHeight);
            updateCropOverlay();
            
            cropOverlay.style.display = 'block';
            cropZoneDiv.classList.remove('hidden');
            addCropZoneBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler Zone de Recadrage
            `;
            addCropZoneBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            addCropZoneBtn.classList.add('bg-red-500', 'hover:bg-red-600');
            cropActive = true;
        } else {
            // Désactiver la zone de recadrage
            cropOverlay.style.display = 'none';
            cropZoneDiv.classList.add('hidden');
            cropXInput.value = '';
            cropYInput.value = '';
            cropWInput.value = '';
            cropHInput.value = '';
            addCropZoneBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter Zone de Recadrage
            `;
            addCropZoneBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
            addCropZoneBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            cropActive = false;
        }
    }
    
    // Gestion du redimensionnement de la zone de recadrage
    function handleCropResize(e) {
        if (!cropResizing || !activeHandle) return;
        
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
        
        let newX = startX;
        let newY = startY;
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        // Ajuster en fonction de la poignée active
        if (activeHandle.includes('t')) { // Top
            newY = startY + deltaY;
            newHeight = startHeight - deltaY;
        }
        if (activeHandle.includes('b')) { // Bottom
            newHeight = startHeight + deltaY;
        }
        if (activeHandle.includes('l')) { // Left
            newX = startX + deltaX;
            newWidth = startWidth - deltaX;
        }
        if (activeHandle.includes('r')) { // Right
            newWidth = startWidth + deltaX;
        }
        
        // Empêcher les dimensions négatives
        if (newWidth < 10) {
            if (activeHandle.includes('l')) {
                newX = startX + startWidth - 10;
            }
            newWidth = 10;
        }
        if (newHeight < 10) {
            if (activeHandle.includes('t')) {
                newY = startY + startHeight - 10;
            }
            newHeight = 10;
        }
        
        // Convertir les coordonnées d'affichage en coordonnées originales pour les limites
        const originalX = newX / scaleX;
        const originalY = newY / scaleY;
        const originalWidth = newWidth / scaleX;
        const originalHeight = newHeight / scaleY;
        
        // Limiter aux dimensions de l'image
        let clampedX = originalX;
        let clampedY = originalY;
        let clampedWidth = originalWidth;
        let clampedHeight = originalHeight;
        
        // Vérifier si la zone dépasse les limites de l'image
        if (originalX < 0) {
            clampedX = 0;
            clampedWidth = originalWidth + originalX; // Réduire la largeur
        }
        if (originalY < 0) {
            clampedY = 0;
            clampedHeight = originalHeight + originalY; // Réduire la hauteur
        }
        if (originalX + originalWidth > originalWidth) {
            clampedWidth = originalWidth - originalX;
        }
        if (originalY + originalHeight > originalHeight) {
            clampedHeight = originalHeight - originalY;
        }
        
        // Assurer des dimensions minimales
        clampedWidth = Math.max(10, clampedWidth);
        clampedHeight = Math.max(10, clampedHeight);
        
        // Reconvertir en coordonnées d'affichage
        const scaledX = clampedX * scaleX;
        const scaledY = clampedY * scaleY;
        const scaledWidth = clampedWidth * scaleX;
        const scaledHeight = clampedHeight * scaleY;
        
        // Mettre à jour l'overlay
        cropOverlay.style.left = scaledX + 'px';
        cropOverlay.style.top = scaledY + 'px';
        cropOverlay.style.width = scaledWidth + 'px';
        cropOverlay.style.height = scaledHeight + 'px';
        
        // Mettre à jour les champs
        updateCropInputs(clampedX, clampedY, clampedWidth, clampedHeight);
    }
    
    // Gestion du déplacement de la zone de recadrage
    function handleCropDrag(e) {
        if (!cropDragging) return;
        
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
        
        // Calculer la nouvelle position en pixels d'affichage
        let newX = startX + deltaX;
        let newY = startY + deltaY;
        
        // Convertir en coordonnées originales
        const original = toOriginalCoords(newX, newY);
        
        // Obtenir les dimensions actuelles en coordonnées originales
        const width = parseInt(cropWInput.value, 10);
        const height = parseInt(cropHInput.value, 10);
        
        // Limiter aux dimensions de l'image
        const clampedX = Math.max(0, Math.min(original.x, originalWidth - width));
        const clampedY = Math.max(0, Math.min(original.y, originalHeight - height));
        
        // Reconvertir en coordonnées d'affichage
        const scaled = toScaledCoords(clampedX, clampedY);
        
        // Mettre à jour l'overlay
        cropOverlay.style.left = scaled.x + 'px';
        cropOverlay.style.top = scaled.y + 'px';
        
        // Mettre à jour les champs
        updateCropInputs(
            clampedX,
            clampedY,
            parseInt(cropWInput.value, 10),
            parseInt(cropHInput.value, 10)
        );
    }

    // Écouteurs d'événements pour le point focal
    addFocusPointBtn.addEventListener('click', toggleFocusPoint);
    
    // Mise à jour du point focal depuis les champs de saisie
    focusXInput.addEventListener('input', updateFocusFromInputs);
    focusYInput.addEventListener('input', updateFocusFromInputs);
    
    function updateFocusFromInputs() {
        const x = parseInt(focusXInput.value, 10);
        const y = parseInt(focusYInput.value, 10);
        if (!isNaN(x) && !isNaN(y)) {
            moveMarker(x, y);
            if (!focusActive) {
                toggleFocusPoint();
            }
        }
    }
    
    // Écouteurs d'événements pour la zone de recadrage
    addCropZoneBtn.addEventListener('click', toggleCropZone);
    
    // Mise à jour de la zone de recadrage depuis les champs de saisie
    cropXInput.addEventListener('input', updateCropFromInputs);
    cropYInput.addEventListener('input', updateCropFromInputs);
    cropWInput.addEventListener('input', updateCropFromInputs);
    cropHInput.addEventListener('input', updateCropFromInputs);
    
    function updateCropFromInputs() {
        if (cropActive) {
            updateCropOverlay();
        } else if (!isNaN(parseInt(cropXInput.value, 10)) && 
                  !isNaN(parseInt(cropYInput.value, 10)) && 
                  !isNaN(parseInt(cropWInput.value, 10)) && 
                  !isNaN(parseInt(cropHInput.value, 10))) {
            toggleCropZone();
        }
    }

    // Initialisation
    function initialize() {
        updateScaling();
        image.parentNode.style.position = 'relative';
        
        // Écouteurs d'événements pour le déplacement et le redimensionnement
        document.addEventListener('mouseup', () => {
            if (focusDragging) {
                focusDragging = false;
                if (focusMarker) focusMarker.style.cursor = 'move';
            }
            
            // Réinitialiser les drapeaux de recadrage aussi
            if (cropDragging) {
                cropDragging = false;
                if (cropOverlay) cropOverlay.style.cursor = 'move';
            }
            cropResizing = false;
            activeHandle = null;
            document.body.style.cursor = 'default';
        });
        
        document.addEventListener('mousemove', (e) => {
            // Gestion du déplacement du point focal
            if (focusDragging && focusMarker) {
                const imageRect = image.getBoundingClientRect();
                // Calculer la position cible relative à l'image
                const targetScaledX = e.clientX - imageRect.left - focusDragOffsetX;
                const targetScaledY = e.clientY - imageRect.top - focusDragOffsetY;
                
                // Convertir en coordonnées originales
                const original = toOriginalCoords(targetScaledX, targetScaledY);
                moveMarker(original.x, original.y);
            }
            
            // Gestion du déplacement de la zone de recadrage
            if (cropDragging) {
                handleCropDrag(e);
            }
            
            // Gestion du redimensionnement de la zone de recadrage
            if (cropResizing) {
                handleCropResize(e);
            }
        });
    }

    // Initialiser après le chargement de l'image
    if (image.complete) {
        initialize();
    } else {
        image.addEventListener('load', initialize);
    }
    
    // Mettre à jour l'échelle lors du redimensionnement de la fenêtre
    window.addEventListener('resize', updateScaling);
});
