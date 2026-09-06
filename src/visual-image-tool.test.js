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

	it("should detach global listeners on destroy", () => {
		// JSDOM swallows exceptions thrown inside a listener and reports them as
		// an error event, so dispatching alone would look like a pass. Capture
		// them instead.
		const errors = [];
		const onError = (event) => {
			event.preventDefault();
			errors.push(event.error ?? event.message);
		};
		window.addEventListener("error", onError);

		try {
			instance.destroy();
			instance = null;

			// The handlers dereference this.state, which destroy() nulls out. A
			// leaked listener therefore blows up on the next global event.
			window.dispatchEvent(new Event("resize"));
			document.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
			document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		} finally {
			window.removeEventListener("error", onError);
		}

		expect(errors).toEqual([]);
	});

	it("should detach overlay listeners on destroy", () => {
		instance.toggleFocusPoint(true);
		instance.toggleCropZone(true);
		const focusMarker = instance.state.focusMarker;
		const cropHandle = instance.cropHandles[0];

		expect(cropHandle).toBeDefined();

		instance.destroy();
		instance = null;

		expect(() =>
			focusMarker.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })),
		).not.toThrow();
		expect(() =>
			cropHandle.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })),
		).not.toThrow();
	});

	it("should be safe to destroy twice", () => {
		instance.destroy();
		expect(() => instance.destroy()).not.toThrow();
		instance = null;
	});

	it("should namespace the spinner keyframes to avoid colliding with the host page", () => {
		const styleElement = document.getElementById(
			"visual-image-tool-spinner-styles",
		);

		expect(styleElement).not.toBeNull();

		// A bare `spin` would collide with an animation of the same name on the
		// consuming page, and the later stylesheet would silently win.
		expect(styleElement.innerHTML).toContain(
			"@keyframes visual-image-tool-spin",
		);
		expect(styleElement.innerHTML).not.toMatch(/@keyframes\s+spin\b/);
		expect(instance.spinnerElement.style.animation).toContain(
			"visual-image-tool-spin",
		);
	});

	it("should inject the spinner stylesheet only once across instances", () => {
		const second = new VisualImageTool({ imageElement });

		expect(
			document.querySelectorAll("#visual-image-tool-spinner-styles"),
		).toHaveLength(1);

		second.destroy();

		// The stylesheet is shared, so it must survive one instance being torn
		// down while another is still alive.
		expect(
			document.getElementById("visual-image-tool-spinner-styles"),
		).not.toBeNull();
		expect(instance.spinnerElement.style.animation).toContain(
			"visual-image-tool-spin",
		);
	});

	it("should hide the spinner once the image dimensions are known", () => {
		expect(instance.spinnerElement.style.display).toBe("none");
		expect(instance.initialLoadComplete).toBe(true);
	});

	it("should remove the spinner from the DOM on destroy", () => {
		const spinner = instance.spinnerElement;
		expect(container.contains(spinner)).toBe(true);

		instance.destroy();
		instance = null;

		expect(container.contains(spinner)).toBe(false);
	});

	it("should resize the crop zone from the handle that was grabbed", () => {
		instance.toggleCropZone(true);
		const handle = instance.cropHandles.find((h) => h.dataset.handle === "br");

		handle.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

		expect(instance.interaction.cropResizing).toBe(true);
		expect(instance.interaction.activeHandle).toBe("br");
	});

	describe("partial style overrides", () => {
		// Overriding one style property used to replace the whole style object,
		// leaving every property the caller did not mention unset.
		let tool;

		afterEach(() => {
			tool?.destroy();
			tool = null;
		});

		it("keeps the focus marker's other defaults", () => {
			tool = new VisualImageTool({
				imageElement,
				focusPoint: { style: { width: "40px" } },
			});
			tool.toggleFocusPoint(true);
			const marker = tool.state.focusMarker;

			expect(marker.style.width).toBe("40px");
			expect(marker.style.height).toBe("30px");
			expect(marker.style.border).toBe("3px solid white");
			expect(marker.style.backgroundColor).toBe("rgba(255, 0, 0, 0.5)");
			expect(marker.style.boxShadow).not.toBe("");
		});

		it("keeps the crop overlay's other defaults", () => {
			tool = new VisualImageTool({
				imageElement,
				cropZone: { style: { border: "2px solid red" } },
			});
			tool.toggleCropZone(true);
			const overlay = tool.state.cropOverlay;

			expect(overlay.style.border).toBe("2px solid red");
			expect(overlay.style.backgroundColor).toBe("rgba(0, 0, 0, 0.4)");
		});

		it("keeps a resize handle's other defaults", () => {
			tool = new VisualImageTool({
				imageElement,
				cropZone: { handleStyle: { width: "20px" } },
			});
			tool.toggleCropZone(true);
			const handle = tool.cropHandles.find((h) => h.dataset.handle === "br");

			expect(handle.style.width).toBe("20px");
			expect(handle.style.height).toBe("14px");
			expect(handle.style.backgroundColor).toBe("white");
			expect(handle.style.border).toBe("2px solid black");
			expect(handle.style.boxShadow).not.toBe("");
		});

		it("still lets scalar options through untouched", () => {
			tool = new VisualImageTool({
				imageElement,
				focusPoint: { enabled: false, style: { width: "40px" } },
			});

			expect(tool.options.focusPoint.enabled).toBe(false);
			expect(tool.options.focusPoint.style.width).toBe("40px");
			expect(tool.options.focusPoint.style.height).toBe("30px");

			// A disabled feature stays disabled.
			tool.toggleFocusPoint(true);
			expect(tool.state.focusActive).toBe(false);
		});

		it("falls back to the defaults when no style is given at all", () => {
			tool = new VisualImageTool({
				imageElement,
				cropZone: { enabled: true },
			});

			expect(tool.options.cropZone.style.border).toBe("1px dashed #fff");
			expect(tool.options.cropZone.handleStyle.width).toBe("14px");
		});
	});
});
