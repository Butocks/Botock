# Survey Investigation Report: Reference Implementation (`image-crop`) & UI Standards

## 1. Observation

### 1.1 Directory & File Layout of Reference Implementation
The reference implementation is located at `/home/mir/Documents/botock/frontend/app/tools/image-crop/` and contains three files:
- `page.tsx` (58 lines, 2072 bytes)
- `ImageCropClient.tsx` (186 lines, 7866 bytes)
- `error.tsx` (37 lines, 1264 bytes)

### 1.2 Structure of `page.tsx` (`frontend/app/tools/image-crop/page.tsx`)
`page.tsx` is a Server Component that handles SEO, structured data, and dynamic client component loading.

1. **Dynamic Import with Loading Skeleton** (Lines 4-11):
```tsx
const ImageCropClient = dynamic(() => import("./ImageCropClient"), {
  loading: () => (
    <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Image Engine...</p>
    </div>
  ),
});
```
2. **Metadata Export** (Lines 13-20):
```tsx
export const metadata: Metadata = {
  title: "Crop & Resize Image Online - Botock",
  description: "Quickly crop, resize, and edit your images securely in your browser without uploading to any server.",
  openGraph: {
    title: "Crop Image Online - Botock",
    description: "Secure, in-browser image cropping and resizing tool.",
  },
};
```
3. **Structured Data (JSON-LD Schema Markup)** (Lines 35-52):
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Botock Image Cropper",
      "operatingSystem": "Web Browser",
      "applicationCategory": "MultimediaApplication",
      "description": "Browser-based image cropping and resizing utility.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    })
  }}
/>
```
4. **Header and Page Wrapper** (Lines 24-32):
```tsx
<div className="max-w-5xl mx-auto py-12 px-4">
  <div className="text-center mb-10">
    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
      Crop & Resize Image
    </h1>
    <p className="text-slate-600 dark:text-slate-400">
      Perfectly frame your pictures. All image processing happens instantly in your browser to protect your privacy.
    </p>
  </div>
  ...
  <ImageCropClient />
</div>
```

### 1.3 Structure of `ImageCropClient.tsx` (`frontend/app/tools/image-crop/ImageCropClient.tsx`)
`ImageCropClient.tsx` is a Client Component (`"use client"`) that encapsulates the interactive state and client-side processing.

1. **State Management** (Lines 10-12, 35):
```tsx
const [image, setImage] = useState<string | null>(null);
const [croppedImage, setCroppedImage] = useState<string | null>(null);
const cropperRef = useRef<ReactCropperElement>(null);
const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
```
2. **Image Loading & Drag-and-Drop via `react-dropzone`** (Lines 14-33):
```tsx
const onDrop = useCallback((acceptedFiles: File[]) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setCroppedImage(null);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }
}, []);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/webp": [".webp"]
  },
  maxFiles: 1,
});
```
3. **Dropzone UI Component** (Lines 70-88):
```tsx
<div
  {...getRootProps()}
  className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
    isDragActive
      ? "border-emerald-500 bg-emerald-500/5"
      : "border-slate-300 dark:border-white/[0.1] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
  }`}
>
  <input {...getInputProps()} />
  <div className="w-16 h-16 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
    <ImageIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
  </div>
  <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
    Drop an Image here
  </p>
  <p className="text-sm text-slate-500 dark:text-slate-400">
    Supports JPG, PNG, WEBP.
  </p>
</div>
```
4. **Interactive Editor Grid Layout (Two Columns)** (Lines 90-181):
   - Outer card: `w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm`
   - Left column (`lg:col-span-2`): Contains the editor canvas and auxiliary buttons (e.g., Rotate 90°, Start Over).
   - Right column (`flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8`): Contains the primary action button, preview area, and download button.
5. **Processing Action & State Feedback** (Lines 37-45, 153-158):
```tsx
const handleCrop = () => {
  const cropper = cropperRef.current?.cropper;
  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    if (canvas) {
      setCroppedImage(canvas.toDataURL("image/png", 1.0));
    }
  }
};

<button
  onClick={handleCrop}
  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2"
>
  Apply Crop & Preview
</button>
```
   *(Note: For async operations like in `pdf-merge/PDFMergeClient.tsx`, `isProcessing` state is used with `<Loader2 className="w-5 h-5 animate-spin" />` and disabled button states).*
6. **Result Preview & Download Handling** (Lines 160-174):
```tsx
{croppedImage ? (
  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result Preview</div>
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-4">
      <img src={croppedImage} alt="Cropped preview" className="max-w-full max-h-[250px] object-contain rounded-lg shadow-sm" />
    </div>
    <a
      href={croppedImage}
      download="Botock-Cropped-Image.png"
      className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
    >
      <Download className="w-4 h-4" /> Download Result
    </a>
  </div>
) : (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-white/[0.05] rounded-xl text-slate-400">
    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
    <p className="text-sm">Click "Apply Crop & Preview" to see your result here.</p>
  </div>
)}
```

### 1.4 Structure of `error.tsx` (`frontend/app/tools/image-crop/error.tsx`)
Crash isolation is implemented via Next.js App Router error boundaries:
```tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ImageCropError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Image Crop Tool crashed:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        Image Processing Failed
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        We encountered an error while processing your image. This might be due to an unsupported format or an excessively large file size. Thanks to Botock's isolated architecture, the rest of the application remains unaffected.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-transform active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
```

### 1.5 Registration in `ToolEngine.ts` (`frontend/app/tools/ToolEngine.ts`)
Lines 89-106 show how `image-crop` is registered:
```typescript
ToolRegistry.registerTool({
  id: "image-crop",
  name: "Crop Image",
  description: "Crop and resize images instantly in the browser.",
  category: "image",
  seoTitle: "Crop Image Online - Botock",
  seoDescription: "Secure, in-browser image cropping and resizing tool. Free and easy to use.",
  endpoint: "/tools/image-crop",
  isClientSideOnly: true,
  parameters: [
    {
      name: "image",
      type: "file",
      description: "The image file to crop",
      required: true
    }
  ]
});
```

### 1.6 Styling Utilities, Icons, and Dependencies
1. **Component Library**: No shadcn UI component library is present in the repository. All UI elements are built with native JSX/HTML and Tailwind CSS classes.
2. **Icons**: `lucide-react` (version `^1.47.0`) provides icons:
   - `Image as ImageIcon`
   - `Download`
   - `RotateCw`
   - `Trash2`
   - `RefreshCcw` / `RefreshCw`
   - `FileUp`
   - `FileText`
   - `X`
   - `Loader2`
   - `AlertTriangle` / `AlertCircle`
   - `Sparkles`
3. **Tailwind Styling Conventions**:
   - Palette for Image Tools: Emerald accents (`bg-emerald-600`, `hover:bg-emerald-500`, `text-emerald-500`, `border-emerald-500`, `bg-emerald-500/5`).
   - Dark theme support: `dark:bg-[#121215]`, `dark:bg-[#09090b]`, `dark:border-white/[0.08]`, `dark:border-white/[0.1]`, `dark:text-white`, `dark:text-slate-300`, `dark:text-slate-400`.
   - Card styling: `rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 shadow-sm`.
   - Buttons: `rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md`.
   - Sliders (found in video-editor): `className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-white/[0.1] rounded-lg cursor-pointer"`.
   - Number/Text inputs: `className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"`.
4. **Current Baseline Build**:
   - `npm run build` completed successfully (exit code 0).
   - Prerendered 21 routes including `/tools/image-crop` statically.
5. **Missing Packages for R1 Tools**:
   - `frontend/package.json` does NOT yet include:
     - `pica` / `react-image-file-resizer` (for `image-resize`)
     - `browser-image-compression` (for `image-compress`)
     - `@imgly/background-removal` (for `image-remove-bg`)
   - `image-to-webp` and `image-upscale` use native Canvas API and require no third-party npm package.

---

## 2. Logic Chain

1. **Analysis of File Conventions**:
   - From Section 1.1 and 1.2, every tool directory in `frontend/app/tools/[tool-name]` follows a strict triad of files:
     1. `page.tsx`: Server Component for Next.js SSR/SSG and SEO metadata.
     2. `<Name>Client.tsx` (or `Client.tsx`): Client Component containing the browser-only logic and UI.
     3. `error.tsx`: Next.js Error Boundary for crash isolation.
   - `page.tsx` dynamically imports the Client component using Next.js `dynamic(() => import(...), { loading: ... })` to avoid SSR hydration mismatches and window/DOM reference errors.

2. **Analysis of SEO Architecture**:
   - From Section 1.2, `page.tsx` exports both standard `Metadata` (title, description, openGraph) and renders an inline JSON-LD `<script type="application/ld+json">` targeting `SoftwareApplication`. This fulfills Rule 3 of `tool_architecture.md`.

3. **Analysis of Client State & Execution Flow**:
   - From Section 1.3, the lifecycle of a client tool is:
     1. Empty state: Shows `react-dropzone` file drop area.
     2. Loaded state: Displays a two-column responsive grid (`grid-cols-1 lg:grid-cols-3`):
        - Column 1 (`lg:col-span-2`): Canvas/preview area and configuration controls (sliders, aspect ratios, dimensions).
        - Column 2 (`lg:col-span-1`): Process CTA button, loading spinner (`Loader2 animate-spin`) during calculation, result preview image, and download button.
     3. Reset: "Start Over" button sets state back to `null`, returning user to dropzone.

4. **Analysis of Crash Resilience**:
   - From Section 1.4 and `tool_architecture.md` Rule 2, each tool folder has its own `error.tsx`. If a WebGL or WASM error occurs during client processing (e.g. out of memory or corrupted image bytes), the crash is caught within `/tools/[tool-name]/error.tsx`. It displays a user-friendly error message highlighting Botock's isolated architecture and offers a `reset()` button. The rest of the platform continues running unaffected.

5. **Analysis of AI Agent Integration**:
   - From Section 1.5, each tool must have a corresponding entry in `frontend/app/tools/ToolEngine.ts` inside `ToolRegistry.registerTool({ ... })` defining parameters, category (`image`), SEO metadata, endpoint, and `isClientSideOnly: true`.

---

## 3. Caveats

1. **Client Component Naming**: In `image-crop`, the file is named `ImageCropClient.tsx` rather than `Client.tsx`. However, either naming works as long as `page.tsx` imports it correctly.
2. **Third-Party Image Libraries**: For `image-resize`, `image-compress`, and `image-remove-bg`, the npm packages are not yet installed in `package.json`. Builder agents will need to install them or provide reliable zero-dependency Canvas-based fallbacks where appropriate. Specifically for `@imgly/background-removal`, model assets must run in-browser (ONNX / WASM), and for Next.js bundling, worker/wasm asset handling must be verified during `npm run build`.
3. **Concurrent Builds**: Next.js 16 lock mechanism prevents multiple parallel `next build` processes from executing simultaneously. Build verifications must be run sequentially.

---

## 4. Conclusion

The `image-crop` reference implementation establishes an exact, repeatable template for all 5 new image tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`):

1. **Directory Structure**:
   `frontend/app/tools/[tool-name]/`
   ├── `page.tsx` (Server Component: SEO Metadata, JSON-LD Schema, Dynamic Client Import)
   ├── `[ToolName]Client.tsx` (Client Component: react-dropzone, parameter controls, processing, preview, download)
   └── `error.tsx` (Client Component: Isolated Error Boundary with reset)

2. **Registry**:
   Register each tool in `frontend/app/tools/ToolEngine.ts` with `ToolRegistry.registerTool({...})`.

3. **UI Styling & Theme**:
   - Tailwind utility classes (no shadcn).
   - Emerald accent theme (`bg-emerald-600`, `text-emerald-500`, `border-emerald-500`) for image category tools.
   - Dark theme compatibility via `dark:bg-[#121215]`, `dark:border-white/[0.08]`, `dark:text-white`.
   - `lucide-react` icons.
   - Two-column layout when an image is loaded (2/3 editor & controls, 1/3 action CTA, preview & download).

---

## 5. Verification Method

To verify any tool following this pattern:
1. **File Existence Check**:
   Confirm existence of `page.tsx`, `*Client.tsx`, and `error.tsx` in `frontend/app/tools/[tool-name]`.
2. **Registration Check**:
   Grep `ToolEngine.ts` for the tool ID:
   ```bash
   grep -n "id: \"[tool-name]\"" frontend/app/tools/ToolEngine.ts
   ```
3. **Build & Type Check**:
   Execute Next.js production build:
   ```bash
   cd /home/mir/Documents/botock/frontend && npm run build
   ```
   Verify build completes with exit code 0 and prerenders `/tools/[tool-name]` without errors.
