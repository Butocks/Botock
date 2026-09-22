/**
 * ToolEngine Architecture Interface
 * 
 * This defines the standard schema for all 100+ Botock creative tools.
 * It ensures that every tool is exposed in a way that a future AI Agent Assistant
 * can understand its purpose, inputs, and outputs, allowing the agent to
 * automatically invoke the tool based on natural language requests.
 */

export type ToolCategory = "pdf" | "image" | "video" | "ai";

export interface ToolParameterBounds {
  min?: number;
  max?: number;
  step?: number;
}

export interface ToolParameter {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "enum";
  description: string;
  required: boolean;
  options?: string[]; // For enum types
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  bounds?: ToolParameterBounds;
}

export interface ToolOutput {
  name: string;
  type: "file" | "string" | "number" | "boolean" | "object";
  mimeType?: string;
  description: string;
}

export interface ToolSchema {
  id: string; // e.g., "pdf-merge"
  name: string; // e.g., "Merge PDF"
  description: string; // Human and AI readable description of what the tool does
  category: ToolCategory;
  parameters: ToolParameter[];
  outputs?: ToolOutput[]; // AI agent output schema
  
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

// ============================================================================
// Video Suite Registrations (Milestone 2)
// ============================================================================

ToolRegistry.registerTool({
  id: "video-trim",
  name: "Trim Video",
  description: "Cut and trim video clips instantly with fast lossless stream copy or frame-accurate re-encoding in the browser via FFmpeg WebAssembly.",
  category: "video",
  seoTitle: "Trim Video Online Free - Fast Lossless Video Cutter - Botock",
  seoDescription: "Cut and trim video clips instantly in your browser using client-side FFmpeg WebAssembly. Fast lossless stream copy or frame-accurate cut. 100% private, no server uploads.",
  endpoint: "/tools/video-trim",
  isClientSideOnly: true,
  parameters: [
    {
      name: "video",
      type: "file",
      description: "The video file to trim (MP4, WebM, MOV, MKV)",
      required: true,
    },
    {
      name: "startTime",
      type: "number",
      description: "Start time offset in seconds for the trimmed segment",
      required: false,
      default: 0,
      min: 0,
      bounds: { min: 0 },
    },
    {
      name: "endTime",
      type: "number",
      description: "End time offset in seconds for the trimmed segment (defaults to video duration if omitted)",
      required: false,
      min: 0,
      bounds: { min: 0 },
    },
    {
      name: "mode",
      type: "enum",
      description: "Trimming mode: 'fast' for instant lossless stream copy (-c copy) or 'accurate' for frame-accurate re-encoding",
      required: false,
      options: ["fast", "accurate"],
      default: "fast",
    },
  ],
  outputs: [
    {
      name: "trimmedVideo",
      type: "file",
      mimeType: "video/mp4",
      description: "The trimmed video file as an MP4 Blob",
    },
  ],
});

ToolRegistry.registerTool({
  id: "video-speed",
  name: "Change Video Speed",
  description: "Speed up or slow down video playback from 0.25x to 4.0x with pitch-preserved audio synchronization via FFmpeg WebAssembly.",
  category: "video",
  seoTitle: "Change Video Speed Online Free - Fast Forward & Slow Motion - Botock",
  seoDescription: "Speed up or slow down video playback from 0.25x to 4x directly in your browser with pitch-preserved audio. 100% private, client-side WebAssembly video speed controller.",
  endpoint: "/tools/video-speed",
  isClientSideOnly: true,
  parameters: [
    {
      name: "video",
      type: "file",
      description: "The video file to adjust playback speed for (MP4, WebM, MOV)",
      required: true,
    },
    {
      name: "speed",
      type: "number",
      description: "Playback speed multiplier between 0.25 (slow motion) and 4.0 (fast forward)",
      required: false,
      default: 1.5,
      min: 0.25,
      max: 4.0,
      step: 0.25,
      bounds: { min: 0.25, max: 4.0, step: 0.25 },
      options: ["0.25", "0.5", "0.75", "1.25", "1.5", "2.0", "3.0", "4.0"],
    },
    {
      name: "muteAudio",
      type: "boolean",
      description: "Mute or remove the audio track from the speed-adjusted video",
      required: false,
      default: false,
    },
    {
      name: "preservePitch",
      type: "boolean",
      description: "Maintain natural audio pitch using chained atempo filters when modifying speed",
      required: false,
      default: true,
    },
  ],
  outputs: [
    {
      name: "speedAdjustedVideo",
      type: "file",
      mimeType: "video/mp4",
      description: "The speed-adjusted video file as an MP4 Blob",
    },
  ],
});

ToolRegistry.registerTool({
  id: "video-to-mp3",
  name: "Convert Video to MP3",
  description: "Extract crystal-clear MP3 audio streams from video files locally in your browser using client-side FFmpeg WebAssembly.",
  category: "video",
  seoTitle: "Convert Video to MP3 Online Free - Audio Extractor - Botock",
  seoDescription: "Extract high-quality MP3 audio from any video (MP4, WebM, MOV, MKV) directly in your browser. 100% private, client-side WebAssembly audio extractor with zero server uploads.",
  endpoint: "/tools/video-to-mp3",
  isClientSideOnly: true,
  parameters: [
    {
      name: "video",
      type: "file",
      description: "The video file to extract audio from (MP4, WebM, MOV, MKV)",
      required: true,
    },
    {
      name: "bitrate",
      type: "enum",
      description: "Target MP3 audio encoding bitrate preset",
      required: false,
      options: ["320k", "192k", "128k", "vbr"],
      default: "192k",
    },
    {
      name: "channels",
      type: "number",
      description: "Audio channels: 2 for Stereo or 1 for Mono",
      required: false,
      min: 1,
      max: 2,
      bounds: { min: 1, max: 2 },
      default: 2,
    },
  ],
  outputs: [
    {
      name: "audio",
      type: "file",
      mimeType: "audio/mpeg",
      description: "Extracted high-fidelity MP3 audio track as a downloadable file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "video-compress",
  name: "Compress Video",
  description: "Reduce MP4 and WebM video file sizes using client-side H.264 CRF encoding and resolution downscaling in FFmpeg WebAssembly.",
  category: "video",
  seoTitle: "Compress Video Online Free - Reduce Video File Size - Botock",
  seoDescription: "Reduce MP4 and WebM video file sizes in your browser using client-side H.264 compression without server uploads. 100% private, adjust CRF and resolution with instant savings.",
  endpoint: "/tools/video-compress",
  isClientSideOnly: true,
  parameters: [
    {
      name: "video",
      type: "file",
      description: "The video file to compress (MP4, WebM, MOV)",
      required: true,
    },
    {
      name: "preset",
      type: "enum",
      description: "Compression quality preset: light (CRF 24), balanced (CRF 28), heavy (CRF 32), or custom",
      required: false,
      options: ["light", "balanced", "heavy", "custom"],
      default: "balanced",
    },
    {
      name: "crf",
      type: "number",
      description: "Constant Rate Factor for H.264 video compression (18 to 38, lower is higher quality)",
      required: false,
      min: 18,
      max: 38,
      bounds: { min: 18, max: 38 },
      default: 28,
    },
    {
      name: "resolution",
      type: "enum",
      description: "Target maximum output resolution downscaling",
      required: false,
      options: ["original", "1080p", "720p", "480p"],
      default: "original",
    },
  ],
  outputs: [
    {
      name: "compressedVideo",
      type: "file",
      mimeType: "video/mp4",
      description: "The compressed video file as an MP4 Blob",
    },
  ],
});

// ============================================================================
// Advanced PDF Tools Registrations (Milestone 3)
// ============================================================================

ToolRegistry.registerTool({
  id: "pdf-ocr",
  name: "OCR PDF (Scanned to Text)",
  description: "Extract plain, editable text from scanned documents and images within PDF files using PDF.js and Tesseract.js client-side OCR.",
  category: "pdf",
  seoTitle: "PDF OCR - Extract Text from Scanned PDFs Online Free - Botock",
  seoDescription: "Extract editable text and copy text from scanned PDF files directly in your browser. 100% client-side Optical Character Recognition (OCR) with zero server uploads.",
  endpoint: "/tools/pdf-ocr",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The scanned PDF document to perform OCR on",
      required: true,
    },
    {
      name: "language",
      type: "enum",
      description: "Language model for OCR text recognition: eng (English), spa (Spanish), fra (French), deu (German)",
      required: false,
      options: ["eng", "spa", "fra", "deu"],
      default: "eng",
    },
    {
      name: "pageRange",
      type: "string",
      description: "Page range specification to process (e.g. 'all', '1-5', '1,3,7')",
      required: false,
      default: "all",
    },
  ],
  outputs: [
    {
      name: "extractedText",
      type: "string",
      mimeType: "text/plain",
      description: "Recognized plain text extracted from the scanned PDF pages",
    },
    {
      name: "textFile",
      type: "file",
      mimeType: "text/plain",
      description: "Downloadable .txt file containing the full recognized document text",
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-compress",
  name: "Compress PDF",
  description: "Reduce PDF file size by intelligent raster image downsampling and object stream compaction locally via pdf-lib and HTML5 Canvas.",
  category: "pdf",
  seoTitle: "Compress PDF Online - Reduce PDF File Size Free - Botock",
  seoDescription: "Shrink and compress PDF file size securely in your browser. Downsample raster images and compact object streams locally with zero server uploads.",
  endpoint: "/tools/pdf-compress",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document to compress",
      required: true,
    },
    {
      name: "preset",
      type: "enum",
      description: "Compression preset: balanced (65% quality, 1080p max), maximum (45% quality, 720p max), or high_quality (80% quality, 2K max)",
      required: false,
      options: ["balanced", "maximum", "high_quality"],
      default: "balanced",
    },
  ],
  outputs: [
    {
      name: "compressedPdf",
      type: "file",
      mimeType: "application/pdf",
      description: "The compressed PDF document as a downloadable file",
    },
  ],
});

// ============================================================================
// Backend Document Conversion Suite Registrations (Milestone 4)
// ============================================================================

ToolRegistry.registerTool({
  id: "pdf-to-word",
  name: "PDF to Word Converter",
  description: "Convert PDF documents into editable Microsoft Word (.docx) files with preserved layout, formatting, and fonts.",
  category: "pdf",
  seoTitle: "Convert PDF to Word Online Free - DOCX Converter - Botock",
  seoDescription: "Convert PDF documents to editable Microsoft Word (.docx) files accurately. Fast, secure, and preserves formatting.",
  endpoint: "/api/convert/pdf-to-docx",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document to convert to Word DOCX format (.pdf, application/pdf)",
      required: true,
      options: [".pdf", "application/pdf"],
    },
  ],
  outputs: [
    {
      name: "docxFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      description: "The converted Microsoft Word (.docx) document",
    },
  ],
});

ToolRegistry.registerTool({
  id: "word-to-pdf",
  name: "Word to PDF Converter",
  description: "Convert Microsoft Word documents (.docx, .doc) into high-fidelity, printable PDF files.",
  category: "pdf",
  seoTitle: "Convert Word to PDF Online Free - DOCX to PDF - Botock",
  seoDescription: "Convert Word DOC and DOCX documents into clean, portable PDFs instantly with perfect layout preservation.",
  endpoint: "/api/convert/docx-to-pdf",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The Word document (.docx or .doc) to convert to PDF",
      required: true,
      options: [
        ".docx",
        ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ],
    },
  ],
  outputs: [
    {
      name: "pdfFile",
      type: "file",
      mimeType: "application/pdf",
      description: "The converted PDF document",
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-to-excel",
  name: "PDF to Excel Converter",
  description: "Extract data tables from PDF documents into structured Microsoft Excel (.xlsx) spreadsheets.",
  category: "pdf",
  seoTitle: "Convert PDF to Excel Online Free - Extract Tables to XLSX - Botock",
  seoDescription: "Extract tables and tabular data from PDF files into editable Excel (.xlsx) spreadsheets automatically.",
  endpoint: "/api/convert/pdf-to-excel",
  isClientSideOnly: false,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document containing tables to extract into an Excel spreadsheet (.pdf, application/pdf)",
      required: true,
      options: [".pdf", "application/pdf"],
    },
  ],
  outputs: [
    {
      name: "excelFile",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      description: "The generated Excel (.xlsx) spreadsheet containing extracted tables across sheets",
    },
  ],
});


