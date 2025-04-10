# VisualImageTool

Un outil léger en JavaScript vanilla pour définir des points focaux et zones de recadrage sur des images.

## Fonctionnalités

- **Point focal** : Définissez un point d'intérêt sur l'image avec un marqueur visuel
- **Zone de recadrage** : Définissez une zone de recadrage avec poignées de redimensionnement
- **Sans dépendances** : Fonctionne sans bibliothèques externes
- **API simple** : Interface claire et facile à utiliser
- **Personnalisable** : Options de configuration flexibles
- **Responsive** : S'adapte aux redimensionnements d'écran

## Installation

```bash
npm install @killerwolf/visual-image-tool
```

## Guide de démarrage rapide

### 1. Importation

```javascript
// Importation ES modules (recommandé)
import VisualImageTool from '@killerwolf/visual-image-tool';

// OU importation CommonJS
const VisualImageTool = require('@killerwolf/visual-image-tool');

// OU utilisation directe via balise script (UMD)
// <script src="node_modules/image-tool/dist/image-tool.umd.js"></script>
```

### 2. Initialisation

```javascript
// Créer une instance avec une image
const imageTool = new VisualImageTool.VisualImageTool({
  imageElement: document.getElementById('myImage'),
  onChange: (data) => {
    console.log('Point focal:', data.focusPoint);
    console.log('Zone de recadrage:', data.cropZone);
  }
});
```

### 3. Utilisation des fonctionnalités

```javascript
// Activer le point focal
imageTool.toggleFocusPoint(true);

// Activer la zone de recadrage
imageTool.toggleCropZone(true);

// Définir manuellement un point focal
imageTool.setFocusPoint(x, y);

// Définir manuellement une zone de recadrage
imageTool.setCropZone(x, y, width, height);

// Obtenir les valeurs actuelles
const focusPoint = imageTool.getFocusPoint();
const cropZone = imageTool.getCropZone();
```

## Options de configuration

```javascript
const imageTool = new VisualImageTool.VisualImageTool({
  // Élément image (obligatoire) - peut être un sélecteur CSS ou un élément DOM
  imageElement: '#myImage',
  
  // Configuration du point focal (optionnel)
  focusPoint: {
    enabled: true, // Activer/désactiver la fonctionnalité
    style: {
      width: '30px',
      height: '30px',
      border: '3px solid white',
      boxShadow: '0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)',
      backgroundColor: 'rgba(255, 0, 0, 0.5)'
    }
  },
  
  // Configuration de la zone de recadrage (optionnel)
  cropZone: {
    enabled: true, // Activer/désactiver la fonctionnalité
    style: {
      border: '1px dashed #fff',
      backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    handleStyle: {
      width: '14px',
      height: '14px',
      backgroundColor: 'white',
      border: '2px solid black',
      boxShadow: '0 0 3px rgba(0,0,0,0.5)'
    }
  },
  
  // Callback appelé lors des changements (optionnel)
  onChange: function(data) {
    // data contient focusPoint, cropZone, focusActive, cropActive
  }
});
```

## API complète

### Méthodes

#### `toggleFocusPoint(active)`
Active ou désactive le point focal.
- `active` (boolean, optionnel): Si défini, force l'état à cette valeur. Si omis, inverse l'état actuel.
- Retourne: L'instance VisualImageTool pour le chaînage.

#### `toggleCropZone(active)`
Active ou désactive la zone de recadrage.
- `active` (boolean, optionnel): Si défini, force l'état à cette valeur. Si omis, inverse l'état actuel.
- Retourne: L'instance VisualImageTool pour le chaînage.

#### `setFocusPoint(x, y)`
Définit la position du point focal.
- `x` (number): Coordonnée X en pixels originaux.
- `y` (number): Coordonnée Y en pixels originaux.
- Retourne: L'instance VisualImageTool pour le chaînage.

#### `setCropZone(x, y, width, height)`
Définit la position et les dimensions de la zone de recadrage.
- `x` (number): Coordonnée X en pixels originaux.
- `y` (number): Coordonnée Y en pixels originaux.
- `width` (number): Largeur en pixels originaux.
- `height` (number): Hauteur en pixels originaux.
- Retourne: L'instance VisualImageTool pour le chaînage.

#### `getFocusPoint()`
Obtient la position actuelle du point focal.
- Retourne: Un objet `{x, y}` avec les coordonnées en pixels originaux.

#### `getCropZone()`
Obtient la position et les dimensions actuelles de la zone de recadrage.
- Retourne: Un objet `{x, y, width, height}` avec les valeurs en pixels originaux.

#### `getImageDimensions()`
Obtient les dimensions originales de l'image.
- Retourne: Un objet `{width, height}` avec les dimensions en pixels originaux.

#### `destroy()`
Détruit l'instance et nettoie les ressources.

### Événements

L'outil utilise le callback `onChange` pour notifier des changements. Ce callback reçoit un objet avec les propriétés suivantes:

```javascript
{
  focusPoint: {x, y},           // Position du point focal
  cropZone: {x, y, width, height}, // Position et dimensions de la zone de recadrage
  focusActive: true|false,      // État d'activation du point focal
  cropActive: true|false        // État d'activation de la zone de recadrage
}
```

## Exemples d'intégration avec des frameworks

### React

```jsx
import React, { useEffect, useRef } from 'react';
import VisualImageTool from '@killerwolf/visual-image-tool';

function ImageEditor() {
  const imageRef = useRef(null);
  const toolRef = useRef(null);
  
  useEffect(() => {
    if (imageRef.current && !toolRef.current) {
      toolRef.current = new VisualImageTool({
        imageElement: imageRef.current,
        onChange: (data) => {
          console.log('Données mises à jour:', data);
        }
      });
      
      // Activer les fonctionnalités
      toolRef.current.toggleFocusPoint(true);
      toolRef.current.toggleCropZone(true);
    }
    
    // Nettoyage
    return () => {
      if (toolRef.current) {
        toolRef.current.destroy();
        toolRef.current = null;
      }
    };
  }, []);
  
  return (
    <div>
      <img ref={imageRef} src="path/to/image.jpg" alt="Éditable" />
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <img ref="editableImage" src="path/to/image.jpg" alt="Éditable" />
  </div>
</template>

<script>
import VisualImageTool from '@killerwolf/visual-image-tool';

export default {
  data() {
    return {
      imageTool: null
    };
  },
  mounted() {
    this.imageTool = new VisualImageTool({
      imageElement: this.$refs.editableImage,
      onChange: (data) => {
        console.log('Données mises à jour:', data);
      }
    });
    
    // Activer les fonctionnalités
    this.imageTool.toggleFocusPoint(true);
    this.imageTool.toggleCropZone(true);
  },
  beforeDestroy() {
    if (this.imageTool) {
      this.imageTool.destroy();
      this.imageTool = null;
    }
  }
};
</script>
```

## Démos

Consultez le dossier `demos/` pour des exemples complets :

- `basic-usage.html` : Exemple d'utilisation basique
- `custom-config.html` : Exemple avec configuration personnalisée
- `react-integration.jsx` : Exemple d'intégration avec React
- `vue-integration.js` : Exemple d'intégration avec Vue.js

## Compatibilité navigateur

- Chrome (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Edge (dernières versions)

## Licence

MIT
