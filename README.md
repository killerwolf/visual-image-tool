# VisualImageTool

A lightweight vanilla JavaScript tool to define focus points and crop zones on images.

## Features

- **Focus point**: Set a point of interest on the image with a visual marker
- **Crop zone**: Define a crop zone with resize handles
- **No dependencies**: Works without external libraries
- **Simple API**: Clear and easy-to-use interface
- **Customizable**: Flexible configuration options
- **Responsive**: Adapts to screen resizing

## Installation

```bash
npm install @h4md1/visual-image-tool
```

## Quick Start Guide

### 1. Import

```javascript
// ES modules import (recommended)
import VisualImageTool from '@h4md1/visual-image-tool';

// OR CommonJS import
const VisualImageTool = require('@h4md1/visual-image-tool');

// OR direct usage via script tag (UMD)
// <script src="node_modules/image-tool/dist/image-tool.umd.js"></script>
```

### 2. Initialization

```javascript
// Create an instance with an image
const imageTool = new VisualImageTool.VisualImageTool({
  imageElement: document.getElementById('myImage'),
  onChange: (data) => {
    console.log('Focus point:', data.focusPoint);
    console.log('Crop zone:', data.cropZone);
  }
});
```

### 3. Using the Features

```javascript
// Enable the focus point
imageTool.toggleFocusPoint(true);

// Enable the crop zone
imageTool.toggleCropZone(true);

// Manually set a focus point
imageTool.setFocusPoint(x, y);

// Manually set a crop zone
imageTool.setCropZone(x, y, width, height);

// Get current values
const focusPoint = imageTool.getFocusPoint();
const cropZone = imageTool.getCropZone();
```

## Configuration Options

```javascript
const imageTool = new VisualImageTool.VisualImageTool({
  // Image element (required) - can be a CSS selector or a DOM element
  imageElement: '#myImage',
  
  // Focus point configuration (optional)
  focusPoint: {
    enabled: true, // Enable/disable the feature
    style: {
      width: '30px',
      height: '30px',
      border: '3px solid white',
      boxShadow: '0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)',
      backgroundColor: 'rgba(255, 0, 0, 0.5)'
    }
  },
  
  // Crop zone configuration (optional)
  cropZone: {
    enabled: true, // Enable/disable the feature
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
  
  // Callback called on changes (optional)
  onChange: function(data) {
    // data contains focusPoint, cropZone, focusActive, cropActive
  }
});
```

## Full API

### Methods

#### `toggleFocusPoint(active)`
Enables or disables the focus point.
- `active` (boolean, optional): If set, forces the state to this value. If omitted, toggles the current state.
- Returns: The VisualImageTool instance for chaining.

#### `toggleCropZone(active)`
Enables or disables the crop zone.
- `active` (boolean, optional): If set, forces the state to this value. If omitted, toggles the current state.
- Returns: The VisualImageTool instance for chaining.

#### `setFocusPoint(x, y)`
Sets the position of the focus point.
- `x` (number): X coordinate in original pixels.
- `y` (number): Y coordinate in original pixels.
- Returns: The VisualImageTool instance for chaining.

#### `setCropZone(x, y, width, height)`
Sets the position and dimensions of the crop zone.
- `x` (number): X coordinate in original pixels.
- `y` (number): Y coordinate in original pixels.
- `width` (number): Width in original pixels.
- `height` (number): Height in original pixels.
- Returns: The VisualImageTool instance for chaining.

#### `getFocusPoint()`
Gets the current position of the focus point.
- Returns: An object `{x, y}` with coordinates in original pixels.

#### `getCropZone()`
Gets the current position and dimensions of the crop zone.
- Returns: An object `{x, y, width, height}` with values in original pixels.

#### `getImageDimensions()`
Gets the original dimensions of the image.
- Returns: An object `{width, height}` with dimensions in original pixels.

#### `destroy()`
Destroys the instance and cleans up resources.

### Events

The tool uses the `onChange` callback to notify about changes. This callback receives an object with the following properties:

```javascript
{
  focusPoint: {x, y},                // Position of the focus point
  cropZone: {x, y, width, height},   // Position and dimensions of the crop zone
  focusActive: true|false,           // Activation state of the focus point
  cropActive: true|false             // Activation state of the crop zone
}
```

## Integration Examples with Frameworks

### React

```jsx
import React, { useEffect, useRef } from 'react';
import VisualImageTool from '@h4md1/visual-image-tool';

function ImageEditor() {
  const imageRef = useRef(null);
  const toolRef = useRef(null);
  
  useEffect(() => {
    if (imageRef.current && !toolRef.current) {
      toolRef.current = new VisualImageTool({
        imageElement: imageRef.current,
        onChange: (data) => {
          console.log('Updated data:', data);
        }
      });
      
      // Enable features
      toolRef.current.toggleFocusPoint(true);
      toolRef.current.toggleCropZone(true);
    }
    
    // Cleanup
    return () => {
      if (toolRef.current) {
        toolRef.current.destroy();
        toolRef.current = null;
      }
    };
  }, []);
  
  return (
    <div>
      <img ref={imageRef} src="path/to/image.jpg" alt="Editable" />
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <img ref="editableImage" src="path/to/image.jpg" alt="Editable" />
  </div>
</template>

<script>
import VisualImageTool from '@h4md1/visual-image-tool';

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
        console.log('Updated data:', data);
      }
    });
    
    // Enable features
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

## Demos

See the `demos/` folder for complete examples:

- `basic-usage.html`: Basic usage example
- `custom-config.html`: Example with custom configuration
- `react-integration.jsx`: Example integration with React
- `vue-integration.js`: Example integration with Vue.js

## Browser Compatibility

- Chrome (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Edge (latest versions)

## License

MIT
