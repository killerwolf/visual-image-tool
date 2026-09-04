import { afterEach, beforeEach, describe, expect, it } from "vitest";
import VisualImageTool from "./visual-image-tool.js";

const TRANSPARENT_PNG =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

describe("VisualImageTool", () => {
	let container;
	let imageElement;
	let instance;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);

		imageElement = document.createElement("img");
		imageElement.src = TRANSPARENT_PNG;
		Object.defineProperty(imageElement, "naturalWidth", {
			value: 100,
			configurable: true,
		});
		Object.defineProperty(imageElement, "naturalHeight", {
			value: 100,
			configurable: true,
		});
		container.appendChild(imageElement);

		instance = new VisualImageTool({ imageElement });
	});

	afterEach(() => {
		instance?.destroy();
		document.body.removeChild(container);
	});

	it("should initialize with default focus point at origin", () => {
		expect(instance.getFocusPoint()).toEqual({ x: 0, y: 0 });
		expect(instance.state.focusActive).toBe(false);
	});

	it("should toggle focus point visibility without requiring a coordinate change", () => {
		instance.setFocusPoint(40, 60);
		instance.toggleFocusPoint(true);

		expect(instance.state.focusActive).toBe(true);
		expect(instance.state.focusMarker.style.display).toBe("block");
		expect(instance.getFocusPoint()).toEqual({ x: 40, y: 60 });

		instance.toggleFocusPoint(false);
		expect(instance.state.focusActive).toBe(false);
		expect(instance.state.focusMarker.style.display).toBe("none");
		expect(instance.getFocusPoint()).toEqual({ x: 40, y: 60 });
	});

	it("should update the focus point via setFocusPoint", () => {
		instance.setFocusPoint(50, 50);
		expect(instance.getFocusPoint()).toEqual({ x: 50, y: 50 });

		instance.setFocusPoint(25, 75);
		expect(instance.getFocusPoint()).toEqual({ x: 25, y: 75 });
	});

	it("should expose public API methods", () => {
		expect(typeof instance.getFocusPoint).toBe("function");
		expect(typeof instance.setFocusPoint).toBe("function");
		expect(typeof instance.toggleFocusPoint).toBe("function");
		expect(typeof instance.toggleCropZone).toBe("function");
		expect(typeof instance.destroy).toBe("function");
	});

	it("should remove overlay elements on destroy and allow a second call", () => {
		instance.toggleFocusPoint(true);
		instance.toggleCropZone(true);
		const focusMarker = instance.state.focusMarker;
		const cropOverlay = instance.state.cropOverlay;

		expect(container.contains(focusMarker)).toBe(true);
		expect(container.contains(cropOverlay)).toBe(true);

		instance.destroy();
		expect(instance.state).toBeNull();
		expect(container.contains(focusMarker)).toBe(false);
		expect(container.contains(cropOverlay)).toBe(false);

		// Already destroyed; stop afterEach from tearing it down a second time.
		instance = null;
	});
});
