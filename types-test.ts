/**
 * Compile-time exercise of the public type surface. Nothing here runs — the
 * point is that `npm run types:check` fails if src/index.d.ts drifts away
 * from the API the library actually exposes.
 */
import {
	type ChangeData,
	type CropZone,
	type FocusPoint,
	type ImageDimensions,
	VisualImageTool,
} from "./src/index.js";

declare const img: HTMLImageElement;

// Minimal construction.
new VisualImageTool({ imageElement: img });

// A CSS selector is accepted in place of an element.
new VisualImageTool({ imageElement: "#myImage" });

// Every option, with a typed onChange payload.
const tool = new VisualImageTool({
	imageElement: img,
	debug: true,
	focusPoint: {
		enabled: true,
		style: {
			width: "30px",
			height: "30px",
			border: "3px solid white",
			boxShadow: "0 0 0 2px black",
			backgroundColor: "rgba(255, 0, 0, 0.5)",
		},
	},
	cropZone: {
		enabled: true,
		style: { border: "1px dashed #fff", backgroundColor: "rgba(0,0,0,0.4)" },
		handleStyle: { width: "14px", height: "14px", backgroundColor: "white" },
	},
	onChange: (data: ChangeData) => {
		const _x: number = data.focusPoint.x;
		const _w: number = data.cropZone.width;
		const _active: boolean = data.focusActive && data.cropActive;
	},
});

// Mutators chain.
tool
	.toggleFocusPoint(true)
	.toggleCropZone()
	.setFocusPoint(120, 240)
	.setCropZone(0, 0, 100, 100);

// Accessors return the documented shapes.
const _focus: FocusPoint = tool.getFocusPoint();
const _crop: CropZone = tool.getCropZone();
const _dims: ImageDimensions = tool.getImageDimensions();
tool.destroy();

// @ts-expect-error imageElement is required.
new VisualImageTool({});

// @ts-expect-error setFocusPoint takes two numbers.
tool.setFocusPoint("120", 240);

// @ts-expect-error there is no such option.
new VisualImageTool({ imageElement: img, notAnOption: true });
