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

ToolRegistry.registerTool({
  id: "audio-converter",
  name: "Audio Format Converter",
  description: "Convert audio files between MP3, WAV, AAC, OGG, and FLAC formats with custom bitrates and sample rates.",
  category: "ai",
  seoTitle: "Audio Format Converter Free Online - MP3, WAV, AAC, FLAC - Botock",
  seoDescription: "Convert audio files between MP3, WAV, AAC, OGG, and FLAC directly in your browser.",
  endpoint: "/tools/audio-converter",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "Input audio or video file",
      required: true,
    },
    {
      name: "format",
      type: "enum",
      description: "Target audio format",
      required: true,
      options: ["mp3", "wav", "aac", "ogg", "flac"],
      default: "mp3",
    },
    {
      name: "bitrate",
      type: "enum",
      description: "Audio bitrate for MP3/AAC",
      required: false,
      options: ["320k", "256k", "192k", "128k"],
      default: "192k",
    },
  ],
  outputs: [
    {
      name: "audioFile",
      type: "file",
      description: "The converted audio file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "video-to-gif",
  name: "Video to GIF Maker",
  description: "Convert video footage (MP4, WebM, MOV) into high quality, dithered animated GIFs with custom fps and width.",
  category: "video",
  seoTitle: "Convert Video to GIF Online Free - Fast Animated GIF Maker - Botock",
  seoDescription: "Convert MP4, WebM, and MOV videos to smooth animated GIFs in your browser.",
  endpoint: "/tools/video-to-gif",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The input video file",
      required: true,
    },
    {
      name: "fps",
      type: "enum",
      description: "GIF framerate",
      required: false,
      options: ["10", "15", "20", "24"],
      default: "15",
    },
  ],
  outputs: [
    {
      name: "gifFile",
      type: "file",
      mimeType: "image/gif",
      description: "The converted animated GIF",
    },
  ],
});

ToolRegistry.registerTool({
  id: "video-mute",
  name: "Mute & Reverse Video",
  description: "Remove audio streams from video files or reverse video frame playback.",
  category: "video",
  seoTitle: "Mute & Reverse Video Online Free - Remove Audio - Botock",
  seoDescription: "Strip audio tracks from MP4, WebM, and MOV videos or reverse video footage directly in your browser.",
  endpoint: "/tools/video-mute",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The input video file",
      required: true,
    },
    {
      name: "mode",
      type: "enum",
      description: "Mute audio or reverse video",
      required: true,
      options: ["mute", "reverse"],
      default: "mute",
    },
  ],
  outputs: [
    {
      name: "videoFile",
      type: "file",
      mimeType: "video/mp4",
      description: "The processed video file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "image-convert",
  name: "Image Format Converter",
  description: "Batch convert images between WebP, PNG, and JPG with custom quality controls and transparency support.",
  category: "image",
  seoTitle: "Convert Image Online Free - WebP, PNG, JPG Converter - Botock",
  seoDescription: "Batch convert images between WebP, PNG, and JPG directly in your browser.",
  endpoint: "/tools/image-convert",
  isClientSideOnly: true,
  parameters: [
    {
      name: "files",
      type: "file",
      description: "Input image file(s)",
      required: true,
    },
    {
      name: "format",
      type: "enum",
      description: "Target image format",
      required: true,
      options: ["webp", "png", "jpeg"],
      default: "webp",
    },
  ],
  outputs: [
    {
      name: "images",
      type: "file",
      description: "Converted image files or zip archive",
    },
  ],
});

ToolRegistry.registerTool({
  id: "generate-qr",
  name: "QR Code Generator",
  description: "Generate customized high-resolution QR codes for websites, Wi-Fi networks, text, email, and phone numbers.",
  category: "image",
  seoTitle: "Free QR Code Generator Online - Custom Colors & Wi-Fi - Botock",
  seoDescription: "Generate high-resolution QR codes for websites, Wi-Fi networks, text, email, and phone numbers.",
  endpoint: "/tools/generate-qr",
  isClientSideOnly: true,
  parameters: [
    {
      name: "text",
      type: "string",
      description: "The content or URL to encode into the QR code",
      required: true,
    },
  ],
  outputs: [
    {
      name: "qrImage",
      type: "file",
      mimeType: "image/png",
      description: "The generated QR code PNG image",
    },
  ],
});

ToolRegistry.registerTool({
  id: "extract-archive",
  name: "Archive (ZIP) Extractor",
  description: "Inspect, browse, preview, and extract files from ZIP archives in-browser with zero server uploads.",
  category: "pdf",
  seoTitle: "Extract ZIP Online Free - Unzip Files in Browser - Botock",
  seoDescription: "Open, preview, and extract ZIP archives directly in your browser with zero server uploads.",
  endpoint: "/tools/extract-archive",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "Input ZIP archive",
      required: true,
    },
  ],
  outputs: [
    {
      name: "files",
      type: "object",
      description: "Extracted archive file records",
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-protect",
  name: "Password Protect PDF",
  description: "Encrypt and password protect PDF documents locally in your browser with custom security keys.",
  category: "pdf",
  seoTitle: "Password Protect PDF Online Free - Encrypt PDF - Botock",
  seoDescription: "Secure your PDF files with password protection and encryption directly in your browser.",
  endpoint: "/tools/pdf-protect",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "The PDF document to protect",
      required: true,
    },
    {
      name: "password",
      type: "string",
      description: "Document password",
      required: true,
    },
  ],
  outputs: [
    {
      name: "pdfFile",
      type: "file",
      mimeType: "application/pdf",
      description: "The password-protected PDF document",
    },
  ],
});

ToolRegistry.registerTool({
  id: "zip-compressor",
  name: "ZIP File Compressor",
  description: "Compress multiple files and folders into an encrypted ZIP archive locally in your browser.",
  category: "pdf",
  seoTitle: "Create ZIP File Online Free - Secure ZIP Compressor - Botock",
  seoDescription: "Compress multiple files and folders into a single ZIP archive locally in your browser.",
  endpoint: "/tools/zip-compressor",
  isClientSideOnly: true,
  parameters: [
    {
      name: "files",
      type: "file",
      description: "Files to compress into ZIP archive",
      required: true,
    },
  ],
  outputs: [
    {
      name: "zipFile",
      type: "file",
      mimeType: "application/zip",
      description: "The generated ZIP archive",
    },
  ],
});

ToolRegistry.registerTool({
  id: "image-to-svg",
  name: "Image to SVG Vectorizer",
  description: "Trace and convert PNG and JPG raster images into scalable SVG vector graphics.",
  category: "image",
  seoTitle: "Convert Image to SVG Online Free - Vectorizer - Botock",
  seoDescription: "Convert PNG and JPG raster images into scalable, clean SVG vector graphics in your browser.",
  endpoint: "/tools/image-to-svg",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "Raster image to vectorize",
      required: true,
    },
  ],
  outputs: [
    {
      name: "svgFile",
      type: "file",
      mimeType: "image/svg+xml",
      description: "The vectorized SVG file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "subtitles",
  name: "Subtitle & Caption Tool",
  description: "Convert, edit, and synchronize subtitles between SRT and VTT formats with millisecond timing control.",
  category: "video",
  seoTitle: "Subtitle Editor & Converter Online Free - SRT to VTT - Botock",
  seoDescription: "Convert, adjust timing offset, and edit SRT and VTT subtitles directly in your browser.",
  endpoint: "/tools/subtitles",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "Subtitle file (SRT, VTT, TXT)",
      required: true,
    },
  ],
  outputs: [
    {
      name: "subtitleFile",
      type: "file",
      description: "Converted subtitle file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "convert-document",
  name: "Document Format Converter",
  description: "Convert documents between DOCX, PDF, Text, and HTML formats locally in your browser.",
  category: "pdf",
  seoTitle: "Document Format Converter Online Free - DOCX, PDF, TXT, HTML - Botock",
  seoDescription: "Convert documents between PDF, Word DOCX, Plain Text, and HTML directly in your browser.",
  endpoint: "/tools/convert-document",
  isClientSideOnly: true,
  parameters: [
    {
      name: "file",
      type: "file",
      description: "Document file to convert",
      required: true,
    },
  ],
  outputs: [
    {
      name: "convertedDocument",
      type: "file",
      description: "The converted document file",
    },
  ],
});

ToolRegistry.registerTool({
  id: "pdf-to-jpg",
  name: "PDF to JPG",
  description: "Convert PDF pages to crisp JPEG images with selectable 150/300 DPI resolution and ZIP packaging.",
  category: "pdf",
  seoTitle: "Convert PDF to JPG Online Free - Botock",
  seoDescription: "Convert PDF pages into high-resolution JPG images directly in your browser with zero server uploads.",
  endpoint: "/tools/pdf-to-jpg",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true },
    { name: "dpi", type: "number", description: "Render DPI (150 or 300)", required: false, default: 150 }
  ]
});

ToolRegistry.registerTool({
  id: "jpg-to-pdf",
  name: "JPG to PDF",
  description: "Convert multiple JPG, PNG, and WebP images into a single formatted PDF with custom margins and orientation.",
  category: "pdf",
  seoTitle: "Convert JPG to PDF Online Free - Botock",
  seoDescription: "Turn JPG photos into formatted PDF documents in your browser with drag-and-drop page ordering.",
  endpoint: "/tools/jpg-to-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "images", type: "file", description: "Image files to convert", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "sign-pdf",
  name: "Sign PDF",
  description: "Sign PDF documents online by drawing, typing cursive script, or uploading signature images directly into PDF coordinates.",
  category: "pdf",
  seoTitle: "Sign PDF Online Free - Botock",
  seoDescription: "Create digital signatures and sign PDF contracts directly in your browser with zero cloud uploads.",
  endpoint: "/tools/sign-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document to sign", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "unlock-pdf",
  name: "Unlock PDF",
  description: "Decrypt password-protected PDF documents and produce permanently unencrypted PDFs.",
  category: "pdf",
  seoTitle: "Unlock PDF Online Free - Botock",
  seoDescription: "Remove passwords and security restrictions from PDF files natively in your browser.",
  endpoint: "/tools/unlock-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Encrypted PDF document", required: true },
    { name: "password", type: "string", description: "Document password", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "organize-pdf",
  name: "Organize PDF",
  description: "Visually reorder, rotate individual pages, duplicate, or delete pages from any PDF document.",
  category: "pdf",
  seoTitle: "Organize PDF Online Free - Botock",
  seoDescription: "Visually rearrange, rotate, duplicate, and delete PDF pages directly in your browser.",
  endpoint: "/tools/organize-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document to organize", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-page-numbers",
  name: "Add Page Numbers",
  description: "Insert customizable headers, footers, and page numbers into any PDF with custom position and offsets.",
  category: "pdf",
  seoTitle: "Add Page Numbers to PDF Online Free - Botock",
  seoDescription: "Add custom headers and page numbers to PDF documents directly in your browser.",
  endpoint: "/tools/pdf-page-numbers",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-to-powerpoint",
  name: "PDF to PowerPoint (PPTX)",
  description: "Convert PDF documents into widescreen editable Microsoft PowerPoint (.pptx) presentation slides.",
  category: "pdf",
  seoTitle: "Convert PDF to PowerPoint Online Free - Botock",
  seoDescription: "Convert PDF documents to Microsoft PowerPoint PPTX presentations directly in your browser.",
  endpoint: "/tools/pdf-to-powerpoint",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF presentation file", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "crop-pdf",
  name: "Crop PDF",
  description: "Trim margins and crop PDF page areas with visual bounding boxes natively.",
  category: "pdf",
  seoTitle: "Crop PDF Online Free - Botock",
  seoDescription: "Crop PDF margins and trim pages visually directly in your browser.",
  endpoint: "/tools/crop-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-to-markdown",
  name: "PDF to Markdown",
  description: "Extract structured headings, tables, and text into clean Markdown (.md) formatted text.",
  category: "pdf",
  seoTitle: "Convert PDF to Markdown Online Free - Botock",
  seoDescription: "Extract structured headings and clean markdown from PDF documents directly in your browser.",
  endpoint: "/tools/pdf-to-markdown",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-to-json",
  name: "PDF to JSON",
  description: "Extract structured JSON schema, page dimensions, text content, and coordinates.",
  category: "pdf",
  seoTitle: "Convert PDF to JSON Online Free - Botock",
  seoDescription: "Extract structured JSON text, pages, and metadata from PDF files directly in your browser.",
  endpoint: "/tools/pdf-to-json",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-whiteout",
  name: "PDF Whiteout & Redact",
  description: "Permanently erase confidential text or numbers using paper-white or black vector redactions.",
  category: "pdf",
  seoTitle: "Whiteout & Redact PDF Online Free - Botock",
  seoDescription: "Permanently whiteout or blackout sensitive information from PDF documents in your browser.",
  endpoint: "/tools/pdf-whiteout",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "html-to-pdf",
  name: "HTML to PDF",
  description: "Render raw HTML code, CSS stylesheets, tables, and web templates into printable PDF documents.",
  category: "pdf",
  seoTitle: "Convert HTML to PDF Online Free - Botock",
  seoDescription: "Render HTML and CSS templates to printable PDF documents directly in your browser.",
  endpoint: "/tools/html-to-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "html", type: "string", description: "HTML code snippet", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "repair-pdf",
  name: "Repair Corrupted PDF",
  description: "Rebuild cross-reference tables and recover broken, unreadable PDF files.",
  category: "pdf",
  seoTitle: "Repair Corrupted PDF Online Free - Botock",
  seoDescription: "Recover and repair corrupt PDF documents directly in your browser.",
  endpoint: "/tools/repair-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Corrupted PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-to-pdfa",
  name: "PDF to PDF/A",
  description: "Convert documents to ISO 19005 standard for legal and archival preservation.",
  category: "pdf",
  seoTitle: "Convert PDF to PDF/A Online Free - Botock",
  seoDescription: "Convert PDF documents to long-term ISO archival standard directly in your browser.",
  endpoint: "/tools/pdf-to-pdfa",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document to convert", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "compare-pdf",
  name: "Compare PDF",
  description: "Side-by-side text diffing to spot changes between document revisions.",
  category: "pdf",
  seoTitle: "Compare PDF Files Online Free - Botock",
  seoDescription: "Compare two PDF documents side by side to detect changes directly in your browser.",
  endpoint: "/tools/compare-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file1", type: "file", description: "Original PDF document", required: true },
    { name: "file2", type: "file", description: "Modified PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-forms",
  name: "Create Fillable PDF Forms",
  description: "Add interactive AcroForm text fields and checkboxes to static PDFs.",
  category: "pdf",
  seoTitle: "Create Fillable PDF Forms Online Free - Botock",
  seoDescription: "Create fillable PDF forms with text fields and checkboxes directly in your browser.",
  endpoint: "/tools/pdf-forms",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "excel-to-pdf",
  name: "Excel to PDF",
  description: "Convert XLSX, XLS, and CSV spreadsheets into formatted table PDFs.",
  category: "pdf",
  seoTitle: "Convert Excel to PDF Online Free - Botock",
  seoDescription: "Convert Excel spreadsheets to clean PDF documents directly in your browser.",
  endpoint: "/tools/excel-to-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Excel spreadsheet (.xlsx, .xls, .csv)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "translate-pdf",
  name: "Translate PDF",
  description: "Translate PDF text into 12+ international languages directly in browser.",
  category: "pdf",
  seoTitle: "Translate PDF Online Free - Botock",
  seoDescription: "Translate PDF text into 12+ languages directly in your browser.",
  endpoint: "/tools/translate-pdf",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document to translate", required: true },
    { name: "targetLang", type: "string", description: "Language code (e.g. es, fr, ur)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-ai-summarizer",
  name: "AI PDF Summarizer",
  description: "Condense long PDF reports into bullet points and executive summaries.",
  category: "pdf",
  seoTitle: "AI PDF Summarizer Online Free - Botock",
  seoDescription: "Summarize PDF documents and generate bullet points directly in your browser.",
  endpoint: "/tools/pdf-ai-summarizer",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document to summarize", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "image-filters",
  name: "Photo Filters & Effects",
  description: "Adjust photo brightness, contrast, saturation, and apply presets with client-side canvas filters.",
  category: "image",
  seoTitle: "Photo Filters & Effects Online Free - Botock",
  seoDescription: "Fine-tune brightness, contrast, saturation, and cinematic film presets directly in your browser.",
  endpoint: "/tools/image-filters",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Image file", required: true },
    { name: "brightness", type: "number", description: "Brightness percent", required: false, default: 100 },
    { name: "contrast", type: "number", description: "Contrast percent", required: false, default: 100 }
  ]
});

ToolRegistry.registerTool({
  id: "image-rotate",
  name: "Rotate & Flip Image",
  description: "Rotate images 90, 180, or 270 degrees or mirror flip horizontally and vertically in-browser.",
  category: "image",
  seoTitle: "Rotate & Flip Image Online Free - Botock",
  seoDescription: "Rotate and flip images directly in your browser.",
  endpoint: "/tools/image-rotate",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Image file", required: true },
    { name: "rotation", type: "number", description: "Rotation degrees (0, 90, 180, 270)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "image-watermark",
  name: "Watermark Image",
  description: "Add customizable text watermarks, copyright notices, and custom opacity stamps to photos.",
  category: "image",
  seoTitle: "Add Watermark to Image Online Free - Botock",
  seoDescription: "Add custom watermarks and copyright stamps to images directly in your browser.",
  endpoint: "/tools/image-watermark",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Image file", required: true },
    { name: "text", type: "string", description: "Watermark text", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "image-to-base64",
  name: "Image to Base64",
  description: "Convert images to Base64 strings, Data URIs, HTML img tags, and CSS background snippets.",
  category: "image",
  seoTitle: "Convert Image to Base64 Online Free - Botock",
  seoDescription: "Convert images to Base64 code and Data URIs directly in your browser.",
  endpoint: "/tools/image-to-base64",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Image file", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "base64-to-image",
  name: "Base64 to Image",
  description: "Decode raw Base64 strings or Data URIs into downloadable JPG, PNG, or WebP image files.",
  category: "image",
  seoTitle: "Convert Base64 to Image Online Free - Botock",
  seoDescription: "Convert Base64 strings to downloadable images directly in your browser.",
  endpoint: "/tools/base64-to-image",
  isClientSideOnly: true,
  parameters: [
    { name: "base64String", type: "string", description: "Base64 string or Data URI", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "image-color-picker",
  name: "Image Color Picker",
  description: "Eyedropper tool to inspect exact HEX, RGB, and HSL codes and palettes directly on images.",
  category: "image",
  seoTitle: "Image Color Picker Online Free - Botock",
  seoDescription: "Extract exact HEX and RGB color codes from images directly in your browser.",
  endpoint: "/tools/image-color-picker",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Image file to sample", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "json-formatter",
  name: "JSON Formatter & Validator",
  description: "Format, validate, beautify, and minify JSON with syntax verification in browser.",
  category: "ai",
  seoTitle: "JSON Formatter & Validator Online Free - Botock",
  seoDescription: "Format, validate, and minify JSON data directly in your browser.",
  endpoint: "/tools/json-formatter",
  isClientSideOnly: true,
  parameters: [
    { name: "jsonString", type: "string", description: "Raw JSON string", required: true },
    { name: "indent", type: "number", description: "Indent spaces", required: false, default: 2 }
  ]
});

ToolRegistry.registerTool({
  id: "hash-generator",
  name: "Cryptographic Hash Generator",
  description: "Generate SHA-256, SHA-512, and MD5 hashes via native hardware WebCrypto API.",
  category: "ai",
  seoTitle: "Hash Generator Online Free - Botock",
  seoDescription: "Generate SHA-256, SHA-512, MD5, and SHA-1 cryptographic hashes directly in your browser.",
  endpoint: "/tools/hash-generator",
  isClientSideOnly: true,
  parameters: [
    { name: "text", type: "string", description: "Input text string", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "password-generator",
  name: "Secure Password Generator",
  description: "Generate cryptographically secure random passwords using CSPRNG bytes in browser.",
  category: "ai",
  seoTitle: "Secure Password Generator Online Free - Botock",
  seoDescription: "Generate high-entropy secure passwords directly in your browser with zero server storage.",
  endpoint: "/tools/password-generator",
  isClientSideOnly: true,
  parameters: [
    { name: "length", type: "number", description: "Password length", required: false, default: 16 }
  ]
});

ToolRegistry.registerTool({
  id: "video-rotate",
  name: "Rotate & Flip Video",
  description: "Rotate videos 90, 180, 270 degrees or mirror flip horizontally/vertically via WASM FFmpeg.",
  category: "video",
  seoTitle: "Rotate Video Online Free - Botock",
  seoDescription: "Rotate and flip videos directly in your browser with zero server uploads.",
  endpoint: "/tools/video-rotate",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Video file", required: true },
    { name: "rotation", type: "number", description: "Rotation degrees (90, 180, 270)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "video-filters",
  name: "Video Filters & Effects",
  description: "Color grade, adjust brightness/contrast, and apply cinematic presets via WASM FFmpeg.",
  category: "video",
  seoTitle: "Video Filters & Color Effects Online Free - Botock",
  seoDescription: "Adjust video brightness, contrast, saturation, and cinematic presets directly in your browser.",
  endpoint: "/tools/video-filters",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Video file", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "video-volume",
  name: "Adjust Video Volume",
  description: "Boost quiet audio up to 500% or lower volume with lossless video stream copy in browser.",
  category: "video",
  seoTitle: "Adjust Video Volume Online Free - Botock",
  seoDescription: "Boost quiet video audio or decrease volume directly in your browser with zero server uploads.",
  endpoint: "/tools/video-volume",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Video file", required: true },
    { name: "volumePercent", type: "number", description: "Volume percentage (0-500)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "video-convert",
  name: "Video Format Converter",
  description: "Convert videos between MP4, WebM, MKV, MOV, and AVI containers via browser WASM.",
  category: "video",
  seoTitle: "Convert Video Format Online Free - Botock",
  seoDescription: "Convert video containers and formats directly in your browser with zero server uploads.",
  endpoint: "/tools/video-convert",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Video file", required: true },
    { name: "targetExt", type: "string", description: "Target format (mp4, webm, mov, mkv, avi)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "audio-volume",
  name: "Adjust Audio Volume",
  description: "Boost quiet audio levels up to 500% or lower volume directly in browser via WASM FFmpeg.",
  category: "video",
  seoTitle: "Adjust Audio Volume Online Free - Botock",
  seoDescription: "Boost quiet audio or lower volume directly in your browser with zero server uploads.",
  endpoint: "/tools/audio-volume",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Audio file", required: true },
    { name: "volumePercent", type: "number", description: "Target volume percent (0-500)", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "audio-trim",
  name: "Audio Cutter & Trimmer",
  description: "Cut unwanted audio segments and create ringtones with stream copy via WASM FFmpeg.",
  category: "video",
  seoTitle: "Trim Audio Online Free - Botock",
  seoDescription: "Cut and extract audio clips directly in your browser with lossless stream copy.",
  endpoint: "/tools/audio-trim",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "Audio file", required: true },
    { name: "startTime", type: "number", description: "Start time in seconds", required: true },
    { name: "endTime", type: "number", description: "End time in seconds", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "xml-formatter",
  name: "XML Formatter & Beautifier",
  description: "Format, validate, beautify, and minify XML and SVG code with client DOMParser.",
  category: "ai",
  seoTitle: "XML Formatter & Beautifier Online Free - Botock",
  seoDescription: "Format, validate, and minify XML data directly in your browser.",
  endpoint: "/tools/xml-formatter",
  isClientSideOnly: true,
  parameters: [
    { name: "xmlString", type: "string", description: "Raw XML string", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "html-formatter",
  name: "HTML Formatter & Beautifier",
  description: "Format, beautify, and minify HTML markup directly in browser memory.",
  category: "ai",
  seoTitle: "HTML Formatter & Beautifier Online Free - Botock",
  seoDescription: "Format and beautify HTML code directly in your browser.",
  endpoint: "/tools/html-formatter",
  isClientSideOnly: true,
  parameters: [
    { name: "htmlString", type: "string", description: "Raw HTML string", required: true }
  ]
});










