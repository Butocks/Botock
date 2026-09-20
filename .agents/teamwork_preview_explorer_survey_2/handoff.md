# Survey Explorer 2 Handoff Report: ToolEngine & Tool Registry Architecture

## 1. Observation

### 1.1 Location of `ToolEngine.ts`
- **File Path**: `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts` (107 lines).
- **Structure Note**: The project does **not** use a `src/` directory. Next.js App Router root is `/home/mir/Documents/botock/frontend/app/`.

### 1.2 Exact Interface and Types (`ToolEngine.ts`)

#### Categories
```typescript
// frontend/app/tools/ToolEngine.ts:10
export type ToolCategory = "pdf" | "image" | "video" | "ai";
```
*Note: In `frontend/app/tools/page.tsx:25`, the UI category filter also includes `"converters"`, but the core `ToolCategory` in `ToolEngine.ts` strictly accepts `"pdf" | "image" | "video" | "ai"`.*

#### Tool Parameter Interface
```typescript
// frontend/app/tools/ToolEngine.ts:12-18
export interface ToolParameter {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "enum";
  description: string;
  required: boolean;
  options?: string[]; // For enum types
}
```

#### Tool Schema Interface
```typescript
// frontend/app/tools/ToolEngine.ts:20-34
export interface ToolSchema {
  id: string; // e.g., "pdf-merge"
  name: string; // e.g., "Merge PDF"
  description: string; // Human and AI readable description of what the tool does
  category: ToolCategory;
  parameters: ToolParameter[];
  
  // SEO Metadata
  seoTitle: string;
  seoDescription: string;
  
  // The actual executable function or API endpoint for the AI to call
  endpoint: string; // Internal API route or client-side worker path
  isClientSideOnly: boolean; // True if it runs entirely in WASM/Browser
}
```

#### Tool Result Interface
```typescript
// frontend/app/tools/ToolEngine.ts:36-41
export interface ToolResult {
  success: boolean;
  message?: string;
  outputFileUrl?: string;
  errorDetail?: string;
}
```

#### ToolRegistry Class
```typescript
// frontend/app/tools/ToolEngine.ts:44-67
export class ToolRegistry {
  private static tools: Map<string, ToolSchema> = new Map();

  static registerTool(schema: ToolSchema) {
    this.tools.set(schema.id, schema);
  }

  static getTool(id: string): ToolSchema | undefined {
    return this.tools.get(id);
  }

  static getAllTools(): ToolSchema[] {
    return Array.from(this.tools.values());
  }

  // AI Agent helper: find tools by natural language keyword matching (basic implementation)
  static searchTools(query: string): ToolSchema[] {
    const q = query.toLowerCase();
    return this.getAllTools().filter(tool => 
      tool.name.toLowerCase().includes(q) || 
      tool.description.toLowerCase().includes(q)
    );
  }
}
```

### 1.3 Existing Tool Registrations in `ToolEngine.ts`
Two tools are registered at module load time:
1. `pdf-merge` (lines 70–87)
2. `image-crop` (lines 89–106):
```typescript
// frontend/app/tools/ToolEngine.ts:89-106
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

### 1.4 Required Properties per Tool Registration
All fields in `ToolSchema` are non-optional:
- `id`: unique slug identifier matching the route (e.g. `"image-resize"`, `"image-compress"`).
- `name`: user-facing and AI-facing tool title (e.g. `"Resize Image"`).
- `description`: concise explanation of tool functionality for agent reasoning and search.
- `category`: `"image"` (for the 5 new image tools).
- `parameters`: array of `ToolParameter` objects with `name`, `type`, `description`, `required`, and optional `options`.
- `seoTitle`: HTML title tag content matching `page.tsx` metadata.
- `seoDescription`: meta description content matching `page.tsx` metadata.
- `endpoint`: route path (e.g. `"/tools/image-resize"`).
- `isClientSideOnly`: `true` (since all 5 tools process images locally via Canvas / WASM / browser libraries).
*(Note: `icon` and `tags` are NOT part of `ToolSchema` in `ToolEngine.ts`; `icon` is only defined in UI display components like `page.tsx` and `Navbar.tsx`).*

### 1.5 Alignment with `tool_architecture.md` (AI-Agent-Ready Tool Schema)
`tool_architecture.md` mandates:
1. Independent, functional modules: Each tool lives in `app/tools/[tool-name]` with self-contained client logic.
2. Programmatic interface detailing purpose, inputs, and outputs:
   - Inputs: typed via `ToolParameter` (`file`, `string`, `number`, `boolean`, `enum`).
   - Outputs: standard `ToolResult` interface (`success`, `message`, `outputFileUrl`, `errorDetail`).
   - Discovery: `ToolRegistry.searchTools(query)` allows autonomous invocation from natural language text.
3. Crash resilience: Isolated React Error Boundary in `app/tools/[tool-name]/error.tsx`.
4. SEO: Server Component in `page.tsx` with OpenGraph metadata and JSON-LD `SoftwareApplication` schema.

---

## 2. Logic Chain

1. **Schema Requirement**: In `ToolEngine.ts`, registering any new tool requires instantiating `ToolRegistry.registerTool({ ... })` with all properties of `ToolSchema`.
2. **Registration for the 5 Target Tools**:
   Based on the `image-crop` reference and `ORIGINAL_REQUEST.md`, the registrations for the 5 image tools should be structured as follows:

   ```typescript
   // 1. image-resize
   ToolRegistry.registerTool({
     id: "image-resize",
     name: "Image Resizer",
     description: "Resize and scale image dimensions by exact pixels or percentage in the browser.",
     category: "image",
     seoTitle: "Resize Images Online Free - Botock",
     seoDescription: "Quickly resize images by width, height, or percentage directly in your browser. 100% private, no uploads.",
     endpoint: "/tools/image-resize",
     isClientSideOnly: true,
     parameters: [
       { name: "image", type: "file", description: "The image file to resize", required: true },
       { name: "width", type: "number", description: "Target width in pixels", required: false },
       { name: "height", type: "number", description: "Target height in pixels", required: false },
       { name: "percentage", type: "number", description: "Scale percentage (e.g. 50 for 50%)", required: false },
       { name: "maintainAspectRatio", type: "boolean", description: "Keep aspect ratio proportional", required: false }
     ]
   });

   // 2. image-compress
   ToolRegistry.registerTool({
     id: "image-compress",
     name: "Image Compressor",
     description: "Compress and reduce image file size with configurable quality and max MB target in the browser.",
     category: "image",
     seoTitle: "Compress Images Online - Botock",
     seoDescription: "Shrink JPG, PNG, and WebP image sizes in your browser without uploading to any server.",
     endpoint: "/tools/image-compress",
     isClientSideOnly: true,
     parameters: [
       { name: "image", type: "file", description: "The image file to compress", required: true },
       { name: "maxSizeMB", type: "number", description: "Target maximum size in megabytes", required: false },
       { name: "quality", type: "number", description: "Compression quality from 1 to 100", required: false }
     ]
   });

   // 3. image-remove-bg
   ToolRegistry.registerTool({
     id: "image-remove-bg",
     name: "AI Background Remover",
     description: "Automatically isolate subjects and remove image backgrounds using in-browser client-side AI.",
     category: "image",
     seoTitle: "Remove Image Background Online - Botock",
     seoDescription: "Free client-side AI background remover. Automatically cut out image backgrounds locally in your browser.",
     endpoint: "/tools/image-remove-bg",
     isClientSideOnly: true,
     parameters: [
       { name: "image", type: "file", description: "The image file to remove background from", required: true }
     ]
   });

   // 4. image-to-webp
   ToolRegistry.registerTool({
     id: "image-to-webp",
     name: "Image to WebP Converter",
     description: "Convert JPG, PNG, and other image formats to fast, modern WebP format locally in the browser.",
     category: "image",
     seoTitle: "Convert Image to WebP Online - Botock",
     seoDescription: "Convert JPG and PNG images to optimized WebP format instantly in your browser.",
     endpoint: "/tools/image-to-webp",
     isClientSideOnly: true,
     parameters: [
       { name: "image", type: "file", description: "The image file to convert to WebP", required: true },
       { name: "quality", type: "number", description: "WebP quality level (1-100)", required: false }
     ]
   });

   // 5. image-upscale
   ToolRegistry.registerTool({
     id: "image-upscale",
     name: "Image Upscaler",
     description: "Upscale image resolution (2x, 4x) using client-side high-quality bicubic/canvas interpolation.",
     category: "image",
     seoTitle: "Upscale Image Online - Botock",
     seoDescription: "Increase image resolution and size directly in your browser using high-quality client-side interpolation.",
     endpoint: "/tools/image-upscale",
     isClientSideOnly: true,
     parameters: [
       { name: "image", type: "file", description: "The image file to upscale", required: true },
       { name: "scaleFactor", type: "number", description: "Upscale multiplier (e.g. 2 or 4)", required: false }
     ]
   });
   ```

3. **External Registries & UI Locations Requiring Synchronized Updates**:
   - **`frontend/app/tools/page.tsx`**:
     - `tools: ToolItem[]` contains manual listings.
     - Existing image tools are marked `status: "ready"` (lines 140–185). When implemented, their status should be flipped to `"active"` so they show the green "Live Now" badge.
     - `image-crop` is currently still marked `status: "ready"`; it should also be updated to `"active"`.
     - `image-upscale` is completely missing from `frontend/app/tools/page.tsx` lines 140–185 and must be added.
   - **`frontend/app/components/Navbar.tsx`**:
     - Lines 280–293: The "Image Suite (30 Tools)" mega-menu contains links to `/tools/image-remove-bg`, `/tools/image-convert`, `/tools/image-compress`, `/tools/image-crop`, `/tools/image-to-svg`, `/tools/image-upscale`.
     - Notice `/tools/image-convert` is currently linked; adding an alias redirect or aligning href with `/tools/image-to-webp` is recommended.
   - **`frontend/app/components/ToolGlideTicker.tsx`**:
     - Lines 63–71 (`image-remove-bg`), lines 113–121 (`image-to-webp`), lines 156–164 (`image-upscale`) already link to these routes.
   - **`frontend/app/components/ToolsSlider.tsx`**:
     - Lines 74–84 (`image-remove-bg`), lines 124–133 (`image-to-webp`) already link to these routes.
   - **`frontend/app/tools/[slug]/page.tsx`**:
     - The catch-all dynamic construction page handles unbuilt routes. As soon as dedicated folders `frontend/app/tools/<tool-name>` are added, Next.js static routing overrides `[slug]` automatically.

4. **Required Tool Folder Architecture (3-file standard)**:
   For each tool directory `frontend/app/tools/<tool-name>`:
   1. `page.tsx`: Server Component with SEO `metadata`, JSON-LD schema, dynamic import of client component with spinner.
   2. `<ToolName>Client.tsx`: Client Component with dropzone, processing logic, and download button.
   3. `error.tsx`: React Error Boundary for crash isolation.

---

## 3. Caveats

1. **Dependency Constraints**:
   - `frontend/package.json` uses React 19 (`react: 19.2.8`) and Next.js 16 (`next: 16.3.5`).
   - Target libraries mentioned in R1:
     - `browser-image-compression`
     - `@imgly/background-removal`
     - `react-image-file-resizer` or `pica`
   - These packages are **not yet installed** in `frontend/package.json`.
   - When installing third-party packages in React 19, implementers must check for peer dependency conflicts. For example, Canvas API or modern pure ESM libraries may avoid peer dependency issues.
2. **Category Typing**:
   - In `ToolEngine.ts`, `ToolCategory` is `"pdf" | "image" | "video" | "ai"`. If any new category like `"converters"` is ever needed, `ToolCategory` must be updated in `ToolEngine.ts`.
3. **No Central Sitemap Generator**:
   - There is currently no `sitemap.ts` in `frontend/app/`. If dynamic sitemap generation is introduced, `ToolRegistry.getAllTools()` can serve as the data source.

---

## 4. Conclusion

1. `ToolEngine.ts` is located at `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts`.
2. All tools require: `id`, `name`, `description`, `category` (`"pdf" | "image" | "video" | "ai"`), `parameters: ToolParameter[]`, `seoTitle`, `seoDescription`, `endpoint`, and `isClientSideOnly: boolean`.
3. All 5 tools (`image-resize`, `image-compress`, `image-remove-bg`, `image-to-webp`, `image-upscale`) should be registered in `ToolEngine.ts` using `category: "image"` and `isClientSideOnly: true`.
4. Complementary files needing updates:
   - `frontend/app/tools/ToolEngine.ts` (add registrations)
   - `frontend/app/tools/page.tsx` (add `image-upscale`, change statuses to `"active"`)
   - `frontend/app/components/Navbar.tsx` (verify links)
5. Each tool must adhere to the 3-file pattern (`page.tsx`, `*Client.tsx`, `error.tsx`) modeled on `/tools/image-crop`.

---

## 5. Verification Method

1. **Codebase Inspection**:
   - View `/home/mir/Documents/botock/frontend/app/tools/ToolEngine.ts` to inspect types and existing registrations.
   - View `/home/mir/Documents/botock/frontend/app/tools/image-crop/` to confirm the 3-file pattern (`page.tsx`, `ImageCropClient.tsx`, `error.tsx`).
   - View `/home/mir/Documents/botock/frontend/app/tools/page.tsx` around lines 140–185 to verify status and tool array contents.
2. **Build Verification**:
   - Run `npm run build` in `/home/mir/Documents/botock/frontend` to verify TypeScript compiles and App Router validates all routes.
3. **Invalidation Conditions**:
   - If `ToolSchema` interface in `ToolEngine.ts` is changed to include new mandatory fields, the registrations must be updated accordingly.
