# 🗺️ Minimal Viable Product (MVP) Plan for **ImageTool**

## 🎯 MVP Goal
- **Core library fully functional**
- **Build pipeline generates distributable bundles**
- **Demos (basic, React, Vue) work correctly with built library**
- **Tests are optional and not included in MVP**

---

## 1️⃣ Core Library: Finalize & Verify

| Task | Description | Priority |
|-------|-------------|----------|
| **1.1** | **Verify core features work:** focus point toggle, crop zone toggle, drag, resize, API methods (`set/get`, `toggle`, `destroy`) | Must-have |
| **1.2** | **Fix any critical bugs** in these features (e.g., incorrect coordinates, broken resize) | Must-have |
| **1.3** | **Ensure `onChange` callback fires correctly** with expected data | Must-have |
| **1.4** | **Clean up API surface:** no unused or broken methods exposed | Must-have |

---

## 2️⃣ Build Pipeline: Bundle & Export

| Task | Description | Priority |
|-------|-------------|----------|
| **2.1** | **Run `npm run build`** to generate `dist/` bundles (CommonJS, ESM, UMD) | Must-have |
| **2.2** | **Fix any build errors** (e.g., Rollup config issues) | Must-have |
| **2.3** | **Verify bundles export the library correctly** (default + named export) | Must-have |
| **2.4** | **Ensure bundles work in vanilla JS, React, and Vue demos** | Must-have |

---

## 3️⃣ Demos: Validate Integration

| Task | Description | Priority |
|-------|-------------|----------|
| **3.1** | **Basic demo (`basic-usage.html`) works** with built UMD bundle | Must-have |
| **3.2** | **React demo (`react-integration.jsx`) works** with built ESM/CommonJS bundle | Must-have |
| **3.3** | **Vue demo (`vue-integration.js`) works** with built ESM/CommonJS bundle | Must-have |
| **3.4** | **Fix any integration issues** (e.g., import errors, runtime bugs) | Must-have |

---

## 4️⃣ Optional (Not MVP, skip unless trivial)

- Add automated tests
- Add advanced features (e.g., persistence, UI enhancements)
- Add CI/CD
- Improve documentation beyond current state

---

## 🗺️ Visual Plan (Mermaid)

```mermaid
flowchart TD
    A["Core Library"] --> B["Verify core features work"]
    A --> C["Fix critical bugs"]
    A --> D["Ensure onChange callback works"]
    A --> E["Clean up API surface"]

    F["Build Pipeline"] --> G["Run npm run build"]
    F --> H["Fix build errors"]
    F --> I["Verify bundles export correctly"]
    F --> J["Bundles work in all demos"]

    K["Demos"] --> L["Basic demo works"]
    K --> M["React demo works"]
    K --> N["Vue demo works"]
    K --> O["Fix integration issues"]

    A --> F
    F --> K