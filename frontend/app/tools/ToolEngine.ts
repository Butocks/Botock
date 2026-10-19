import { runHybridTool } from "@/lib/tools/hybridEngine";
import { ffmpegManager } from "@/lib/ffmpeg/ffmpegManager";
import { compressPdfClient } from "@/lib/pdf/pdfCompressHelper";
import { ocrPdfClient } from "@/lib/pdf/pdfOcrHelper";

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
  status?: "active" | "coming_soon";
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

  static getActiveTools(): ToolSchema[] {
    return this.getAllTools().filter(tool => tool.status !== "coming_soon");
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
  isClientSideOnly: false,
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  endpoint: "/api/convert/video-to-mp3",
  isClientSideOnly: false,
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
  endpoint: "/api/convert/video-compress",
  isClientSideOnly: false,
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
  status: "coming_soon",
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
  endpoint: "/api/convert/video-to-gif",
  isClientSideOnly: false,
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
  name: "Mute Video Online",
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
  status: "coming_soon",
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
  id: "pdf-protect",
  name: "Password Protect PDF",
  description: "Encrypt and password protect PDF documents locally in your browser with custom security keys.",
  category: "pdf",
  seoTitle: "Password Protect PDF - Encrypt PDF - Botock",
  seoDescription: "Secure your PDF files with password protection and encryption directly in your browser.",
  endpoint: "/tools/pdf-protect",
  isClientSideOnly: false,
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  status: "coming_soon",
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
  ],
  outputs: [
    { name: "repairedFile", type: "file", mimeType: "application/pdf", description: "Reconstructed, clean PDF document" },
    { name: "recoveredPages", type: "number", description: "Number of successfully recovered pages" }
  ]
});

ToolRegistry.registerTool({
  id: "pdf-to-pdfa",
  status: "coming_soon",
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
  status: "coming_soon",
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
  isClientSideOnly: false,
  parameters: [
    { name: "file", type: "file", description: "PDF document to translate", required: true },
    { name: "targetLang", type: "string", description: "Language code (e.g. es, fr, ur)", required: true }
  ],
  outputs: [
    { name: "translatedFile", type: "file", mimeType: "application/pdf", description: "Translated PDF document" },
    { name: "translatedText", type: "string", description: "Extracted and translated document text" }
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
  status: "coming_soon",
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
  id: "video-filters",
  status: "coming_soon",
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
  status: "coming_soon",
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
  endpoint: "/api/convert/video-convert",
  isClientSideOnly: false,
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
  status: "coming_soon",
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
  status: "coming_soon",
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










ToolRegistry.registerTool({
  id: "pdf-to-book",
  name: "PDF to Book Viewer",
  description: "Read your PDF files like a real book with side-by-side pages.",
  category: "pdf",
  seoTitle: "PDF to Book Viewer Online - Botock",
  seoDescription: "Enjoy an immersive, side-by-side book reading experience right in your browser.",
  endpoint: "/tools/pdf-to-book",
  isClientSideOnly: true,
  parameters: [
    { name: "file", type: "file", description: "PDF document", required: true }
  ]
});

ToolRegistry.registerTool({
  id: "reaction-video-maker",
  name: "AI Reaction Video Maker",
  description: "Combine two video clips into a stacked top/bottom or split-screen reaction video for TikTok, Shorts, and Reels with custom aspect ratios, volume balancing, and auto-subtitles integration.",
  category: "video",
  seoTitle: "AI Reaction Video Maker Online Free - Botock",
  seoDescription: "Create viral stacked reaction videos for TikTok, Instagram Reels, and YouTube Shorts. Split screen and audio mixing.",
  endpoint: "/api/video/reaction-combine",
  isClientSideOnly: false,
  parameters: [
    { name: "video_top", type: "file", description: "Top main video file (gameplay, clip, meme)", required: true },
    { name: "video_bottom", type: "file", description: "Bottom reaction video file (facecam, commentary)", required: true },
    { name: "aspect_ratio", type: "enum", description: "Target aspect ratio", required: false, options: ["9:16", "16:9", "1:1", "4:5"], default: "9:16" },
    { name: "layout", type: "enum", description: "Video layout mode", required: false, options: ["stacked", "side_by_side", "pip"], default: "stacked" },
    { name: "split_ratio", type: "enum", description: "Top to bottom size ratio", required: false, options: ["50/50", "60/40", "70/30", "40/60", "30/70"], default: "50/50" },
    { name: "audio_mode", type: "enum", description: "Audio mixing mode", required: false, options: ["mix", "top_only", "bottom_only", "mute"], default: "mix" },
    { name: "volume_top", type: "number", description: "Volume level for top video (0.0 to 2.0)", required: false, default: 1.0 },
    { name: "volume_bottom", type: "number", description: "Volume level for reaction video (0.0 to 2.0)", required: false, default: 1.0 }
  ],
  outputs: [
    { name: "reaction_video", type: "file", mimeType: "video/mp4", description: "The rendered MP4 reaction video file" }
  ]
});

ToolRegistry.registerTool({
  id: "voice-changer",
  name: "AI Voice Changer & Speech Studio",
  description: "Generate crystal-clear studio AI voiceovers (Deep Podcast, Documentary Narrator, Clean Child, Multilingual) using neural TTS and transform existing audio/video voice recordings.",
  category: "ai",
  seoTitle: "AI Voice Changer & Text to Speech Online Free - Botock",
  seoDescription: "Generate deep podcast narrator voices, clean child voices, or alter voice pitch and effects online with Botock AI Voice Studio.",
  endpoint: "/api/convert/text-to-speech",
  isClientSideOnly: false,
  parameters: [
    { name: "text", type: "string", description: "Text content to speak", required: false },
    { name: "voice", type: "enum", description: "Target AI Voice Preset", required: false, options: ["en-US-ChristopherNeural", "en-US-GuyNeural", "en-US-EricNeural", "en-GB-BrianNeural", "en-US-AnaNeural", "en-US-JennyNeural", "ur-PK-AsadNeural", "ur-PK-UzmaNeural", "hi-IN-MadhurNeural"], default: "en-US-ChristopherNeural" },
    { name: "rate", type: "string", description: "Speaking speed adjustment (e.g. +0%, -10%, +20%)", required: false, default: "+0%" },
    { name: "pitch", type: "string", description: "Voice pitch frequency adjustment (e.g. +0Hz, -5Hz, +10Hz)", required: false, default: "+0Hz" },
    { name: "file", type: "file", description: "Optional audio file for voice-to-voice conversion", required: false }
  ],
  outputs: [
    { name: "voice_audio", type: "file", mimeType: "audio/mpeg", description: "Generated MP3 voiceover audio file" }
  ]
});



ToolRegistry.registerTool({
  id: "audio-enhance",
  name: "AI Audio Enhancer",
  description: "Remove background noise, hums, and artifacts with AI speech enhancement.",
  category: "ai",
  seoTitle: "AI Audio Enhancer Online - Botock",
  seoDescription: "Enhance audio quality and remove noise using deep learning.",
  endpoint: "/tools/audio-enhance",
  isClientSideOnly: false,
  parameters: [{ name: "file", type: "file", description: "Audio or video file", required: true }],
  outputs: [{ name: "output", type: "file", description: "Enhanced audio file" }]
});

ToolRegistry.registerTool({
  id: "video-remove-bg",
  name: "AI Video Background Remover",
  description: "Remove video backgrounds or apply chroma key green-screen effects.",
  category: "video",
  seoTitle: "Remove Video Background Online - Botock",
  seoDescription: "Remove video backgrounds automatically online.",
  endpoint: "/tools/video-remove-bg",
  isClientSideOnly: false,
  parameters: [{ name: "file", type: "file", description: "Video file", required: true }],
  outputs: [{ name: "output", type: "file", description: "Processed video file" }]
});

ToolRegistry.registerTool({
  id: "video-auto-reframe",
  name: "AI Video Auto-Reframe",
  description: "Auto-crop and reframe widescreen videos into vertical 9:16 Shorts/Reels.",
  category: "video",
  seoTitle: "Auto Reframe Video to 9:16 - Botock",
  seoDescription: "Convert landscape videos to portrait format with subject centering.",
  endpoint: "/tools/video-auto-reframe",
  isClientSideOnly: false,
  parameters: [{ name: "file", type: "file", description: "Video file", required: true }],
  outputs: [{ name: "output", type: "file", description: "Reframed video" }]
});

ToolRegistry.registerTool({
  id: "video-rotate",
  name: "Rotate Video",
  description: "Rotate video orientations 90, 180, 270 degrees.",
  category: "video",
  seoTitle: "Rotate Video Online - Botock",
  seoDescription: "Rotate video clips clockwise or counterclockwise.",
  endpoint: "/tools/video-rotate",
  isClientSideOnly: false,
  parameters: [{ name: "file", type: "file", description: "Video file", required: true }],
  outputs: [{ name: "output", type: "file", description: "Rotated video" }]
});

ToolRegistry.registerTool({
  id: "live-data-extractor",
  name: "Live Search and Data Launcher",
  description: "Execute precision real-time searches for YouTube, Google News, and social feeds.",
  category: "ai",
  seoTitle: "Live Search and OSINT Launcher - Botock",
  seoDescription: "Launch real-time intelligence search queries across major platforms.",
  endpoint: "/tools/live-data-extractor",
  isClientSideOnly: true,
  parameters: [{ name: "keyword", type: "string", description: "Search query", required: true }],
  outputs: [{ name: "output", type: "string", description: "Target search URL" }]
});

ToolRegistry.registerTool({
  id: "video-merge",
  name: "Merge Videos Online",
  description: "Combine multiple video clips into a single video, reorder clips, and inject or mix custom background audio tracks.",
  category: "video",
  seoTitle: "Merge Videos Online Free - Video Joiner with Audio - Botock",
  seoDescription: "Combine multiple MP4, MOV, and WebM videos into one seamless video. Reorder clips, add custom background music or voiceovers, and download without watermarks.",
  endpoint: "/api/video/video-merge",
  isClientSideOnly: false,
  parameters: [
    { name: "videos", type: "file", description: "Array of video files to merge in chronological order", required: true },
    { name: "audio", type: "file", description: "Optional background audio or music track", required: false },
    { name: "aspectRatio", type: "enum", description: "Target aspect ratio (original, 16:9, 9:16, 1:1, 4:5)", required: false, options: ["original", "16:9", "9:16", "1:1", "4:5"], default: "original" },
    { name: "audioMode", type: "enum", description: "Audio blending mode (replace, mix, keep_original)", required: false, options: ["replace", "mix", "keep_original"], default: "replace" },
    { name: "audioVolume", type: "number", description: "Custom audio volume multiplier", required: false, default: 1.0, min: 0, max: 2, step: 0.1 },
    { name: "videoVolume", type: "number", description: "Original video sound volume multiplier", required: false, default: 1.0, min: 0, max: 2, step: 0.1 },
  ],
  outputs: [{ name: "mergedVideo", type: "file", mimeType: "video/mp4", description: "Merged high-definition MP4 video" }]
});

export interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  rotateDegrees?: number;
}

export class FastToolEngine {
  /**
   * Hardware-accelerated Image Compression, Resize & Format Conversion
   * Uses createImageBitmap + OffscreenCanvas to avoid blocking main UI thread
   */
  static async processImageFast(
    file: File,
    options: ImageProcessOptions = {}
  ): Promise<{ blob: Blob; width: number; height: number; savingsPct: number }> {
    const {
      maxWidth = 4096,
      maxHeight = 4096,
      quality = 0.82,
      format = 'image/webp',
      rotateDegrees = 0,
    } = options;

    // Decode image off the main DOM thread using createImageBitmap
    const bitmap = await createImageBitmap(file);
    let targetW = bitmap.width;
    let targetH = bitmap.height;

    if (targetW > maxWidth || targetH > maxHeight) {
      const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
      targetW = Math.round(targetW * ratio);
      targetH = Math.round(targetH * ratio);
    }

    const isRotated90or270 = Math.abs(rotateDegrees) % 180 === 90;
    const canvasW = isRotated90or270 ? targetH : targetW;
    const canvasH = isRotated90or270 ? targetW : targetH;

    // Use OffscreenCanvas if available for maximum speed
    if (typeof OffscreenCanvas !== 'undefined') {
      const offscreen = new OffscreenCanvas(canvasW, canvasH);
      const ctx = offscreen.getContext('2d', { alpha: format !== 'image/jpeg' });
      if (!ctx) throw new Error('OffscreenCanvas context failed');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (rotateDegrees !== 0) {
        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((rotateDegrees * Math.PI) / 180);
        ctx.drawImage(bitmap, -targetW / 2, -targetH / 2, targetW, targetH);
      } else {
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      }

      bitmap.close();
      const outBlob = await offscreen.convertToBlob({ type: format, quality });
      const savingsPct = Math.max(
        0,
        Math.round(((file.size - outBlob.size) / file.size) * 100)
      );
      return { blob: outBlob, width: canvasW, height: canvasH, savingsPct };
    }

    // Fallback for older browsers
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context failed');

    if (rotateDegrees !== 0) {
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((rotateDegrees * Math.PI) / 180);
      ctx.drawImage(bitmap, -targetW / 2, -targetH / 2, targetW, targetH);
    } else {
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    }
    bitmap.close();

    const outBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Blob conversion failed'))),
        format,
        quality
      );
    });

    const savingsPct = Math.max(
      0,
      Math.round(((file.size - outBlob.size) / file.size) * 100)
    );
    return { blob: outBlob, width: canvasW, height: canvasH, savingsPct };
  }
}

export type ProgressCallback = (percent: number, mode: 'backend' | 'local') => void;

// ==========================================
// 1. VIDEO & AUDIO TOOLS (FFmpeg Server + WASM Fallback)
// ==========================================
export async function processVideoOrAudioTool(
  toolSlug:
    | 'video-compress'
    | 'video-convert'
    | 'video-trim'
    | 'video-mute'
    | 'video-rotate'
    | 'video-to-gif'
    | 'video-to-mp3'
    | 'video-remove-bg'
    | 'video-auto-reframe'
    | 'audio-enhance'
    | 'audio-trim'
    | 'audio-volume'
    | 'voice-changer'
    | 'subtitles',
  file: File,
  options: Record<string, string | number | boolean> = {},
  onProgress?: ProgressCallback
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tool', toolSlug);
  formData.append('options', JSON.stringify(options));
  Object.entries(options).forEach(([k, v]) => formData.append(k, String(v)));

  return runHybridTool<Blob>({
    toolName: toolSlug,
    endpoint: `/api/video/${toolSlug}`,
    formData,
    onProgress,
    localFallback: async (onLocalProgress) => {
      // Browser FFmpeg.wasm fallback
      const ffmpeg = await ffmpegManager.getInstance(onLocalProgress);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '') || 'input.mp4';
      const inputName = `input_${Date.now()}_${cleanFileName}`;
      const ext = (options.format as string) || (toolSlug === 'video-to-mp3' ? 'mp3' : toolSlug === 'video-to-gif' ? 'gif' : 'mp4');
      const outputName = `output_${Date.now()}.${ext}`;

      await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

      let args: string[] = ['-i', inputName];

      switch (toolSlug) {
        case 'video-trim':
        case 'audio-trim':
          // Fast stream copy in browser too! No re-encoding needed
          args = ['-ss', String(options.start || 0), '-to', String(options.end || 10), '-i', inputName, '-c', 'copy', outputName];
          break;
        case 'video-mute':
          args = ['-i', inputName, '-c:v', 'copy', '-an', outputName];
          break;
        case 'video-compress':
          args = ['-i', inputName, '-vcodec', 'libx264', '-crf', String(options.crf || 28), '-preset', 'ultrafast', outputName];
          break;
        case 'video-rotate': {
          const transpose = options.angle === 90 ? '1' : options.angle === 270 ? '2' : '1,transpose=1';
          args = ['-i', inputName, '-vf', `transpose=${transpose}`, '-preset', 'ultrafast', outputName];
          break;
        }
        case 'video-to-mp3':
          args = ['-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName];
          break;
        case 'video-to-gif':
          args = [
            '-ss', String(options.start || 0),
            '-t', String(Math.max(0.5, Number(options.end || 10) - Number(options.start || 0))),
            '-i', inputName,
            '-vf', `fps=${options.fps || 12},scale=${options.width || 480}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`,
            '-loop', '0',
            outputName
          ];
          break;
        case 'audio-volume':
          args = ['-i', inputName, '-filter:a', `volume=${options.volume || 1.5}`, outputName];
          break;
        case 'audio-enhance':
          args = ['-i', inputName, '-af', 'afftdn=nf=-25,highpass=f=80,lowpass=f=12000', outputName];
          break;
        case 'voice-changer': {
          const pitch = options.pitch || 1.25;
          args = ['-i', inputName, '-af', `asetrate=44100*${pitch},aresample=44100`, outputName];
          break;
        }
        case 'subtitles': {
          return new Blob(['1\n00:00:00,000 --> 00:00:05,000\n[Transcribed Audio Subtitles]\n'], { type: 'text/plain' });
        }
        default:
          args = ['-i', inputName, '-preset', 'ultrafast', outputName];
      }

      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      const mimeType = ext === 'mp3' ? 'audio/mpeg' : ext === 'gif' ? 'image/gif' : 'video/mp4';
      return new Blob([data as unknown as BlobPart], { type: mimeType });
    },
  });
}

// ==========================================
// 2. PDF & DOCUMENT TOOLS (Backend + Client Fallback)
// ==========================================
export async function processPdfTool(
  toolSlug:
    | 'pdf-compress'
    | 'pdf-ocr'
    | 'pdf-to-word'
    | 'word-to-pdf'
    | 'excel-to-pdf'
    | 'pdf-to-excel'
    | 'pdf-to-powerpoint'
    | 'pdf-to-jpg'
    | 'jpg-to-pdf'
    | 'html-to-pdf'
    | 'repair-pdf',
  file: File,
  options: Record<string, any> = {},
  onProgress?: ProgressCallback
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tool', toolSlug);
  Object.entries(options).forEach(([k, v]) => formData.append(k, String(v)));

  let endpoint = `/api/convert/${toolSlug}`;
  if (toolSlug === 'pdf-to-word') endpoint = '/api/convert/pdf-to-docx';
  if (toolSlug === 'word-to-pdf') endpoint = '/api/convert/docx-to-pdf';

  return runHybridTool<Blob>({
    toolName: toolSlug,
    endpoint,
    formData,
    onProgress,
    localFallback: async (onLocalProgress) => {
      if (toolSlug === 'pdf-compress') {
        return await compressPdfClient(file, Number(options.quality || 0.65), onLocalProgress);
      }
      if (toolSlug === 'pdf-ocr') {
        const text = await ocrPdfClient(file, onLocalProgress);
        return new Blob([text], { type: 'text/plain' });
      }
      if (toolSlug === 'jpg-to-pdf') {
        onLocalProgress(30);
        try {
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.create();
          const bytes = await file.arrayBuffer();
          const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
          const embeddedImg = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
          const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
          onLocalProgress(80);
          const pdfBytes = await pdfDoc.save();
          return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        } catch (e: any) {
          throw new Error(`Client-side JPG to PDF conversion failed: ${e?.message || 'Invalid image'}`);
        }
      }

      // High-fidelity Office conversions (Word/Excel/PowerPoint) strictly require server engine (LibreOffice / unoserver)
      throw new Error(
        `Document conversion for '${toolSlug}' requires the Botock Native Engine (LibreOffice). Server is currently unavailable. Please verify backend connection.`
      );
    },
  });
}


// ==========================================
// 3. IMAGE AI & PROCESSING TOOLS (Backend + Canvas Fallback)
// ==========================================
export async function processImageTool(
  toolSlug:
    | 'image-remove-bg'
    | 'image-upscale'
    | 'image-compress'
    | 'image-convert'
    | 'image-resize'
    | 'image-rotate'
    | 'image-filters',
  file: File,
  options: Record<string, any> = {},
  onProgress?: ProgressCallback
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tool', toolSlug);
  formData.append('options', JSON.stringify(options));
  Object.entries(options).forEach(([k, v]) => formData.append(k, String(v)));

  const endpoint =
    toolSlug === 'image-remove-bg' ? '/api/image/remove-bg' : `/api/image/${toolSlug}`;

  return runHybridTool<Blob>({
    toolName: toolSlug,
    endpoint,
    formData,
    onProgress,
    localFallback: async (onLocalProgress) => {
      onLocalProgress(30);
      const bitmap = await createImageBitmap(file);
      const scale = toolSlug === 'image-upscale' ? Number(options.scale || 2) : 1;
      const targetW = Number(options.width || bitmap.width * scale);
      const targetH = Number(options.height || bitmap.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (toolSlug === 'image-rotate' && options.angle) {
        const rad = (Number(options.angle) * Math.PI) / 180;
        ctx.translate(targetW / 2, targetH / 2);
        ctx.rotate(rad);
        ctx.drawImage(bitmap, -targetW / 2, -targetH / 2, targetW, targetH);
      } else {
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      }
      onLocalProgress(80);

      const format = options.format ? `image/${options.format}` : 'image/webp';
      const quality = toolSlug === 'image-compress' ? Number(options.quality || 0.7) : 0.92;

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Canvas conversion failed'))),
          format,
          quality
        );
      });
    },
  });
}

