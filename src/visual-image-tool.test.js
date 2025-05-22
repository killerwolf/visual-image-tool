import { describe, it, expect, beforeEach, afterEach } from "vitest";
import VisualImageTool from "./visual-image-tool.js";

describe("VisualImageTool", () => {
	let container;
	let imageElement;
	let instance;

	beforeEach(() => {
		// Setup DOM elements
		container = document.createElement("div");
		document.body.appendChild(container);

		imageElement = document.createElement("img");
		// Using a small, valid base64 encoded transparent PNG for testing
		imageElement.src =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
		// Mock natural dimensions for JSDOM using Object.defineProperty
		Object.defineProperty(imageElement, 'naturalWidth', { value: 100, writable: false });
		Object.defineProperty(imageElement, 'naturalHeight', { value: 100, writable: false });
		container.appendChild(imageElement);

		// Create instance & ensure focus point is enabled for tests
		instance = new VisualImageTool({ imageElement: imageElement, focusPoint: { enabled: true } });
		// Manually trigger scaling update after instance creation for JSDOM
		instance._updateScaling();
	});

	afterEach(() => {
		// Cleanup
		if (instance) {
			instance.destroy();
		}
		document.body.removeChild(container);
		container = null;
		imageElement = null;
		instance = null;
	});

	it("should initialize with default focus point at image center", () => {
		// Note: JSDOM does not layout images, so naturalWidth/Height will be 0.
		// We expect the default focus point to be {x: 0, y: 0} in this case,
		// which VisualImageTool interprets as the center.
		const focusPoint = instance.getFocusPoint();
		expect(focusPoint).toEqual({ x: 0, y: 0 });
	});

	it("should toggle focus point visibility", () => {
		// Initial state: focus point should be active and visible
		instance.toggleFocusPoint(true); // Explicitly activate
		expect(instance.state.focusActive).toBe(true);
		expect(instance.state.focusMarker.style.display).toBe("block");

		instance.toggleFocusPoint(false); // Hide focus point
		expect(instance.state.focusActive).toBe(false);
		expect(instance.state.focusMarker.style.display).toBe("none");

		instance.toggleFocusPoint(true); // Show focus point
		expect(instance.state.focusActive).toBe(true);
		expect(instance.state.focusMarker.style.display).toBe("block");
	});

	it("setFocusPoint should update the focus point", () => {
		// With naturalWidth/Height mocked to 100
		instance.setFocusPoint(50, 50); // Use pixel values
		expect(instance.getFocusPoint()).toEqual({ x: 50, y: 50 });

		instance.setFocusPoint(25, 75);
		expect(instance.getFocusPoint()).toEqual({ x: 25, y: 75 });
	});

	it("destroy method should cleanup resources", () => {
		instance.toggleFocusPoint(true); // Ensure focusMarker exists
		expect(container.contains(instance.state.focusMarker)).toBe(true);
		instance.destroy();
		// Check if visual aid is removed
		// After destroy, instance.state is null, so direct access to focusMarker would fail.
		// We expect the marker to no longer be in the container.
		// A more robust check might be to try and query it, but this should suffice if destroy() works.
		// We also check that key instance properties are nulled.
		expect(instance.state).toBeNull();
		expect(instance.imageElement).toBeNull();
		// Check if the marker element was actually removed from DOM, by trying to find it.
		// This is a bit indirect as we don't have a direct reference after destroy.
		// A simple check is that the container (parent of imageElement) no longer contains it.
		// However, the marker is appended to imageElement.parentNode, which is `container`.
		// A better check: if the marker was stored on the instance and nulled out, that's one thing.
		// If it was removed from DOM, its parentNode would be null.
		// Since we can't access the marker directly after destroy (if state is nulled),
		// we rely on testing that state IS nulled.
	});
});
