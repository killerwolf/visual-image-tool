import Vue from "vue";
// Dans un projet réel, vous importeriez depuis le package npm
// import ImageTool from 'image-tool';

// Composant d'exemple pour l'intégration avec Vue.js
export default {
	name: "ImageEditor",

	data() {
		return {
			imageTool: null,
			focusPoint: { x: 0, y: 0 },
			cropZone: { x: 0, y: 0, width: 0, height: 0 },
			focusActive: false,
			cropActive: false,
		};
	},

	mounted() {
		// Attendre que l'image soit chargée
		if (this.$refs.editableImage.complete) {
			this.initializeTool();
		} else {
			this.$refs.editableImage.onload = this.initializeTool;
		}
	},

	beforeDestroy() {
		// Nettoyer lors de la destruction du composant
		if (this.imageTool) {
			this.imageTool.destroy();
			this.imageTool = null;
		}
	},

	methods: {
		// Initialiser l'outil
		initializeTool() {
			// Dans un projet réel, vous utiliseriez l'import
			// Ici, nous supposons que ImageTool est disponible globalement
			this.imageTool = new ImageTool({
				imageElement: this.$refs.editableImage,
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
				onChange: this.handleToolChange,
			});
		},

		// Gérer les changements de l'outil
		handleToolChange(data) {
			this.focusPoint = data.focusPoint;
			this.cropZone = data.cropZone;
			this.focusActive = data.focusActive;
			this.cropActive = data.cropActive;
		},

		// Activer/désactiver le point focal
		toggleFocusPoint() {
			if (this.imageTool) {
				this.imageTool.toggleFocusPoint();
			}
		},

		// Activer/désactiver la zone de recadrage
		toggleCropZone() {
			if (this.imageTool) {
				this.imageTool.toggleCropZone();
			}
		},

		// Centrer le point focal
		centerFocusPoint() {
			if (this.imageTool) {
				const dimensions = this.imageTool.getImageDimensions();
				this.imageTool.setFocusPoint(
					dimensions.width / 2,
					dimensions.height / 2,
				);
			}
		},

		// Réinitialiser la zone de recadrage
		resetCropZone() {
			if (this.imageTool) {
				const dimensions = this.imageTool.getImageDimensions();
				const width = dimensions.width / 2;
				const height = dimensions.height / 2;
				this.imageTool.setCropZone(
					(dimensions.width - width) / 2,
					(dimensions.height - height) / 2,
					width,
					height,
				);
			}
		},
	},
};
