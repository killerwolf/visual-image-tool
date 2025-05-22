# <img src="demo/android-chrome-192x192.png" alt="Visual Image Tool logo" width="48" height="48" style="vertical-align:middle; margin-right: 0.5em; border-radius: 8px;"> Visual Image Tool

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
import VisualImageTool from "@h4md1/visual-image-tool";

// OR CommonJS import
const VisualImageTool = require("@h4md1/visual-image-tool");

// OR direct usage via script tag (UMD)
// <script src="node_modules/image-tool/dist/image-tool.umd.js"></script>
```

### 2. Initialization

```javascript
// Create an instance with an image
const imageTool = new VisualImageTool.VisualImageTool({
  imageElement: document.getElementById("myImage"),
  debug: true, // Enable debug logs for overlay positioning (optional)
  onChange: (data) => {
    console.log("Focus point:", data.focusPoint);
    console.log("Crop zone:", data.cropZone);
  },
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
  imageElement: "#myImage",

  // Enable debug logs for overlay positioning (optional)
  debug: true, // Set to true to see overlay positioning logs in the console

  // Focus point configuration (optional)
  focusPoint: {
    enabled: true, // Enable/disable the feature
    style: {
      width: "30px",
      height: "30px",
      border: "3px solid white",
      boxShadow: "0 0 0 2px black, 0 0 5px rgba(0,0,0,0.5)",
      backgroundColor: "rgba(255, 0, 0, 0.5)",
    },
  },

  // Crop zone configuration (optional)
  cropZone: {
    enabled: true, // Enable/disable the feature
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
  },

  // Callback called on changes (optional)
  onChange: function (data) {
    // data contains focusPoint, cropZone, focusActive, cropActive
  },
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
import React, { useEffect, useRef } from "react";
import VisualImageTool from "@h4md1/visual-image-tool";

function ImageEditor() {
  const imageRef = useRef(null);
  const toolRef = useRef(null);

  useEffect(() => {
    if (imageRef.current && !toolRef.current) {
      toolRef.current = new VisualImageTool({
        imageElement: imageRef.current,
        onChange: (data) => {
          console.log("Updated data:", data);
        },
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
import VisualImageTool from "@h4md1/visual-image-tool";

export default {
  data() {
    return {
      imageTool: null,
    };
  },
  mounted() {
    this.imageTool = new VisualImageTool({
      imageElement: this.$refs.editableImage,
      onChange: (data) => {
        console.log("Updated data:", data);
      },
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
  },
};
</script>
```

## Demos

The `demo/` folder contains the following examples:

- `basic-usage.html`: Basic usage example
- `custom-config.html`: Custom configuration demo with live controls
- `demo-esm.html`: ESM (ECMAScript Module) integration demo
- `demo-umd.html`: UMD (Universal Module Definition) integration demo
- `index2.html`: Alternate or experimental demo page
- `preact-importmap-demo.html`: Preact integration using importmap
- `react-integration.jsx`: React integration example
- `vue-importmap-demo.html`: Vue integration using importmap
- `vue-integration.js`: Vue integration script

## Browser Compatibility

- Chrome (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Edge (latest versions)

## Code Formatting

This project uses a combination of tools for code formatting and linting to ensure consistency:

- **[Biome](https://biomejs.dev/)**: Handles formatting and linting for JavaScript (`.js`, `.jsx`), TypeScript (`.ts`, `.tsx`), and JSON (`.json`) files.
  - Check: `npm run lint:check` (`biome check .`)
  - Fix: `npm run lint:fix` (`biome check --write .`)
- **[Prettier](https://prettier.io/)**: Handles formatting for other file types like HTML, CSS, Markdown, etc.
  - Check: `npm run format:check` (`prettier --check --ignore-unknown .`)
  - Fix: `npm run format:write` (`prettier --write --ignore-unknown .`)

These formatting checks are automatically enforced in the CI pipeline (see `.github/workflows/code-quality.yml`) to maintain code quality.

## Running Tests

This project uses [Vitest](https://vitest.dev/) for unit testing. To run the tests, use the following npm scripts:

- `npm test`: Runs the tests once.
- `npm run test:watch`: Runs the tests in watch mode, automatically re-running them when files change.

Ensure you have installed the development dependencies by running `npm install` before executing the tests.

## License

MIT
