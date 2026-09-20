/**
 * ToolEngine Architecture Interface
 * 
 * This defines the standard schema for all 100+ Botock creative tools.
 * It ensures that every tool is exposed in a way that a future AI Agent Assistant
 * can understand its purpose, inputs, and outputs, allowing the agent to
 * automatically invoke the tool based on natural language requests.
 */

export type ToolCategory = "pdf" | "image" | "video" | "ai";

export interface ToolParameter {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "enum";
  description: string;
  required: boolean;
  options?: string[]; // For enum types
}

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

export interface ToolResult {
  success: boolean;
  message?: string;
  outputFileUrl?: string;
  errorDetail?: string;
}

// Registry to hold all tools
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

// Initial Registrations
ToolRegistry.registerTool({
  id: "pdf-merge",
  name: "Merge PDF",
  description: "Merge multiple PDF files into a single document instantly in the browser.",
  category: "pdf",
  seoTitle: "Merge PDF Files Online - Botock",
  seoDescription: "Merge multiple PDF files into a single document instantly in your browser. 100% secure, no files uploaded to servers.",
  endpoint: "/tools/pdf-merge",
  isClientSideOnly: true,
  parameters: [
    {
      name: "files",
      type: "file",
      description: "Array of PDF files to merge",
      required: true
    }
  ]
});

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
    {
      name: "image",
      type: "file",
      description: "The image file to resize",
      required: true
    },
    {
      name: "width",
      type: "number",
      description: "Target width in pixels",
      required: false
    },
    {
      name: "height",
      type: "number",
      description: "Target height in pixels",
      required: false
    },
    {
      name: "percentage",
      type: "number",
      description: "Scale percentage (e.g. 50 for 50%)",
      required: false
    },
    {
      name: "maintainAspectRatio",
      type: "boolean",
      description: "Keep aspect ratio proportional",
      required: false
    }
  ]
});

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
    {
      name: "image",
      type: "file",
      description: "The image file to compress",
      required: true
    },
    {
      name: "maxSizeMB",
      type: "number",
      description: "Target maximum size in megabytes",
      required: false
    },
    {
      name: "quality",
      type: "number",
      description: "Compression quality from 1 to 100",
      required: false
    }
  ]
});

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
    {
      name: "image",
      type: "file",
      description: "The image file to remove background from",
      required: true
    }
  ]
});

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
    {
      name: "image",
      type: "file",
      description: "The image file to convert to WebP",
      required: true
    },
    {
      name: "quality",
      type: "number",
      description: "WebP quality level (1-100)",
      required: false
    }
  ]
});

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
    {
      name: "image",
      type: "file",
      description: "The image file to upscale",
      required: true
    },
    {
      name: "scaleFactor",
      type: "number",
      description: "Upscale multiplier (e.g. 2 or 4)",
      required: false
    }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-split",
  name: "Split PDF",
  description: "Extract specific pages or page ranges from a PDF into a new clean document.",
  category: "pdf",
  seoTitle: "Split PDF Online - Botock",
  seoDescription: "Split and extract PDF pages instantly in your browser with zero server uploads.",
  endpoint: "/tools/pdf-split",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to extract pages from",
      required: true
    },
    {
      name: "fromPage",
      type: "number",
      description: "Starting page number",
      required: false
    },
    {
      name: "toPage",
      type: "number",
      description: "Ending page number",
      required: false
    }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-watermark",
  name: "Watermark PDF",
  description: "Stamp customized text watermarks, copyright notices, or confidentiality markers across all PDF pages.",
  category: "pdf",
  seoTitle: "Watermark PDF Online - Botock",
  seoDescription: "Add custom copyright or draft text watermarks to all PDF pages client-side.",
  endpoint: "/tools/pdf-watermark",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to stamp",
      required: true
    },
    {
      name: "text",
      type: "string",
      description: "Watermark text string",
      required: true
    },
    {
      name: "opacity",
      type: "number",
      description: "Opacity between 0.05 and 1",
      required: false
    }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-rotate",
  name: "Rotate PDF",
  description: "Permanently rotate all pages of a PDF document by 90, 180, or 270 degrees.",
  category: "pdf",
  seoTitle: "Rotate PDF Online - Botock",
  seoDescription: "Rotate PDF pages clockwise or counterclockwise client-side with zero server uploads.",
  endpoint: "/tools/pdf-rotate",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to rotate",
      required: true
    },
    {
      name: "angle",
      type: "number",
      description: "Rotation angle in degrees (90, 180, 270)",
      required: true
    }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-page-delete",
  name: "Delete PDF Pages",
  description: "Remove unwanted, confidential, or duplicate pages from any PDF document.",
  category: "pdf",
  seoTitle: "Delete PDF Pages Online - Botock",
  seoDescription: "Select and delete specific pages from any PDF document client-side.",
  endpoint: "/tools/pdf-page-delete",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF file to remove pages from",
      required: true
    },
    {
      name: "pagesToDelete",
      type: "string",
      description: "Comma-separated page numbers to delete",
      required: true
    }
  ]
});

