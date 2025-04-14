import React, { useEffect, useRef, useState } from "react";
// Dans un projet réel, vous importeriez depuis le package npm
// import ImageTool from 'image-tool';

// Composant d'exemple pour l'intégration avec React
function ImageEditor() {
	const imageRef = useRef(null);
	const toolRef = useRef(null);
	const [focusPoint, setFocusPoint] = useState({ x: 0, y: 0 });
	const [cropZone, setCropZone] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [focusActive, setFocusActive] = useState(false);
	const [cropActive, setCropActive] = useState(false);

	// Initialiser l'outil lorsque le composant est monté
	useEffect(() => {
		if (imageRef.current && !toolRef.current) {
			// Attendre que l'image soit chargée
			if (!imageRef.current.complete) {
				imageRef.current.onload = initializeTool;
			} else {
				initializeTool();
			}
		}

		// Nettoyer lors du démontage du composant
		return () => {
			if (toolRef.current) {
				toolRef.current.destroy();
				toolRef.current = null;
			}
		};
	}, []);

	// Fonction pour initialiser l'outil
	const initializeTool = () => {
		// Dans un projet réel, vous utiliseriez l'import
		// Ici, nous supposons que ImageTool est disponible globalement
		toolRef.current = new ImageTool({
			imageElement: imageRef.current,
			focusPoint: {
				enabled: true,
				style: {
					width: "30px",
					height: "30px",
					border: "3px solid white",
					boxShadow: "0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)",
					backgroundColor: "rgba(255, 0, 0, 0.5)",
				},
			},
			cropZone: {
				enabled: true,
				style: {
					border: "1px dashed #fff",
					backgroundColor: "rgba(0, 0, 0, 0.4)",
				},
			},
			onChange: handleToolChange,
		});
	};

	// Gérer les changements de l'outil
	const handleToolChange = (data) => {
		setFocusPoint(data.focusPoint);
		setCropZone(data.cropZone);
		setFocusActive(data.focusActive);
		setCropActive(data.cropActive);
	};

	// Activer/désactiver le point focal
	const toggleFocusPoint = () => {
		if (toolRef.current) {
			toolRef.current.toggleFocusPoint();
		}
	};

	// Activer/désactiver la zone de recadrage
	const toggleCropZone = () => {
		if (toolRef.current) {
			toolRef.current.toggleCropZone();
		}
	};

	// Centrer le point focal
	const centerFocusPoint = () => {
		if (toolRef.current) {
			const dimensions = toolRef.current.getImageDimensions();
			toolRef.current.setFocusPoint(
				dimensions.width / 2,
				dimensions.height / 2,
			);
		}
	};

	// Réinitialiser la zone de recadrage
	const resetCropZone = () => {
		if (toolRef.current) {
			const dimensions = toolRef.current.getImageDimensions();
			const width = dimensions.width / 2;
			const height = dimensions.height / 2;
			toolRef.current.setCropZone(
				(dimensions.width - width) / 2,
				(dimensions.height - height) / 2,
				width,
				height,
			);
		}
	};

	return (
		<div className="image-editor">
			<div className="image-container">
				<img
					ref={imageRef}
					src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80"
					alt="Paysage éditable"
				/>
			</div>

			<div className="controls">
				<h2>Contrôles</h2>
				<button type="button" onClick={toggleFocusPoint}>
					{focusActive ? "Désactiver Point Focal" : "Activer Point Focal"}
				</button>
				<button type="button" onClick={toggleCropZone}>
					{cropActive
						? "Désactiver Zone de Recadrage"
						: "Activer Zone de Recadrage"}
				</button>

				<h3>Actions</h3>
				<button type="button" onClick={centerFocusPoint}>
					Centrer le Point Focal
				</button>
				<button type="button" onClick={resetCropZone}>
					Réinitialiser la Zone de Recadrage
				</button>

				<h3>Données actuelles</h3>
				<div className="data-display">
					<h4>Point Focal</h4>
					<p>
						X: {Math.round(focusPoint.x)}, Y: {Math.round(focusPoint.y)}
					</p>

					<h4>Zone de Recadrage</h4>
					<p>
						X: {Math.round(cropZone.x)}, Y: {Math.round(cropZone.y)}, Largeur:{" "}
						{Math.round(cropZone.width)}, Hauteur: {Math.round(cropZone.height)}
					</p>
				</div>
			</div>
		</div>
	);
}

export default ImageEditor;
