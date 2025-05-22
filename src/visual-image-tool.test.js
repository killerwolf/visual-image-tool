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
		container.appendChild(imageElement);

		// Create instance
		instance = new VisualImageTool(imageElement);
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
		// Initial state check (assuming focus point is visible by default)
		expect(instance.isFocusPointVisible()).toBe(true);

		instance.toggleFocusPoint(false); // Hide focus point
		expect(instance.isFocusPointVisible()).toBe(false);

		instance.toggleFocusPoint(true); // Show focus point
		expect(instance.isFocusPointVisible()).toBe(true);
	});

	it("setFocusPoint should update the focus point", () => {
		instance.setFocusPoint({ x: 0.5, y: 0.5 });
		expect(instance.getFocusPoint()).toEqual({ x: 0.5, y: 0.5 });

		instance.setFocusPoint({ x: -0.5, y: -0.5 });
		expect(instance.getFocusPoint()).toEqual({ x: -0.5, y: -0.5 });
	});

	it("destroy method should cleanup resources", () => {
		expect(container.contains(instance.visualAid)).toBe(true);
		instance.destroy();
		// Check if visual aid is removed
		expect(container.contains(instance.visualAid)).toBe(false);
		// Check if instance properties are nullified (implementation dependent)
		expect(instance.img).toBeNull();
		expect(instance.container).toBeNull();
		expect(instance.visualAid).toBeNull();
	});
});
