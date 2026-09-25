"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Scissors,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileVideo,
  Music,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Lock,
  Code,
  Type,
  Globe,
  FileCode,
  Link2,
  GitCompare,
  ListFilter,
  ArrowUpDown,
  Code2,
  KeyRound,
  Layers,
  Palette,
  Pipette,
  Scale,
  Database,
  Binary,
  Table,
  Ruler,
} from "lucide-react";
import AdBanner from "../components/AdBanner";

interface ToolItem {
  id: string;
  name: string;
  desc: string;
  category: "ai" | "pdf" | "image" | "video" | "converters" | "text" | "dev";
  status: "active" | "ready";
  href: string;
  icon: any;
}

export default function ToolsDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tools: ToolItem[] = [
    // 1. AI Creative Tools (Active)
    {
      id: "video-gen",
      name: "AI Video Generator",
      desc: "Turn text prompts and photos into cinematic videos with Google Flow AI.",
      category: "ai",
      status: "active",
      href: "/tools/video-generator",
      icon: Film,
    },
    {
      id: "image-gen",
      name: "AI Image Generator",
      desc: "Generate photorealistic 8K images and digital art from text prompts.",
      category: "ai",
      status: "active",
      href: "/tools/image-generator",
      icon: Sparkles,
    },
    {
      id: "video-studio",
      name: "In-Browser Video Studio",
      desc: "Trim, crop, speed control, mute audio, and color grade videos with 0ms lag.",
      category: "ai",
      status: "active",
      href: "/tools/video-editor",
      icon: Scissors,
    },
    {
      id: "media-library",
      name: "My Media Library",
      desc: "Instant access to all your generated videos and export to Google Drive.",
      category: "ai",
      status: "active",
      href: "/tools/library",
      icon: Sparkles,
    },

    // 2. PDF Tools
    {
      id: "pdf-merge",
      name: "Merge PDF",
      desc: "Combine multiple PDF documents into a single organized file.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-merge",
      icon: FileText,
    },
    {
      id: "pdf-split",
      name: "Split PDF",
      desc: "Extract specific pages or separate PDF files into parts.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-split",
      icon: FileText,
    },
    {
      id: "pdf-protect",
      name: "Password Protect PDF",
      desc: "Encrypt sensitive PDF documents with custom password security.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-protect",
      icon: Lock,
    },
    {
      id: "pdf-watermark",
      name: "Watermark PDF",
      desc: "Add custom copyright text or image stamps to protect documents.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-watermark",
      icon: FileText,
    },
    {
      id: "pdf-rotate",
      name: "Rotate PDF",
      desc: "Rotate pages 90, 180, or 270 degrees permanently.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-rotate",
      icon: FileText,
    },
    {
      id: "pdf-page-delete",
      name: "Delete PDF Pages",
      desc: "Remove unwanted, confidential, or blank pages from any PDF document.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-page-delete",
      icon: FileText,
    },
    {
      id: "pdf-compress",
      name: "Compress PDF",
      desc: "Reduce PDF file size for email sharing without losing clarity.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-compress",
      icon: FileText,
    },
    {
      id: "pdf-word",
      name: "PDF to Word (DOCX)",
      desc: "Convert PDF documents into fully editable Microsoft Word files.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-word",
      icon: FileText,
    },
    {
      id: "word-pdf",
      name: "Word to PDF",
      desc: "Convert Word DOC/DOCX documents into clean, portable PDFs.",
      category: "pdf",
      status: "active",
      href: "/tools/word-to-pdf",
      icon: FileText,
    },
    {
      id: "pdf-excel",
      name: "PDF to Excel",
      desc: "Extract spreadsheet tables from PDFs into XLSX spreadsheets.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-excel",
      icon: FileSpreadsheet,
    },
    {
      id: "pdf-ocr",
      name: "OCR PDF (Scanned to Text)",
      desc: "Recognize and extract editable text from scanned PDF pages.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-ocr",
      icon: FileText,
    },
    {
      id: "pdf-to-jpg",
      name: "PDF to JPG",
      desc: "Convert PDF pages to high-resolution JPEG images with ZIP download.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-jpg",
      icon: ImageIcon,
    },
    {
      id: "jpg-to-pdf",
      name: "JPG to PDF",
      desc: "Convert multiple JPG, PNG, or WebP images into a single formatted PDF.",
      category: "pdf",
      status: "active",
      href: "/tools/jpg-to-pdf",
      icon: FileText,
    },
    {
      id: "sign-pdf",
      name: "Sign PDF",
      desc: "Draw, type cursive, or upload signatures and burn directly into PDF pages.",
      category: "pdf",
      status: "active",
      href: "/tools/sign-pdf",
      icon: FileText,
    },
    {
      id: "unlock-pdf",
      name: "Unlock PDF",
      desc: "Remove passwords and security restrictions from encrypted PDF documents.",
      category: "pdf",
      status: "active",
      href: "/tools/unlock-pdf",
      icon: Lock,
    },
    {
      id: "organize-pdf",
      name: "Organize PDF",
      desc: "Visually reorder, rotate individual pages, duplicate, or delete pages.",
      category: "pdf",
      status: "active",
      href: "/tools/organize-pdf",
      icon: FileText,
    },
    {
      id: "pdf-page-numbers",
      name: "Add Page Numbers",
      desc: "Insert customizable headers, footers, and page numbers into any PDF.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-page-numbers",
      icon: FileText,
    },
    {
      id: "pdf-to-powerpoint",
      name: "PDF to PowerPoint (PPTX)",
      desc: "Convert PDF documents into widescreen editable Microsoft PowerPoint slides.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-powerpoint",
      icon: FileText,
    },
    {
      id: "crop-pdf",
      name: "Crop PDF",
      desc: "Trim margins and crop PDF page areas with visual bounding boxes.",
      category: "pdf",
      status: "active",
      href: "/tools/crop-pdf",
      icon: Scissors,
    },
    {
      id: "pdf-to-markdown",
      name: "PDF to Markdown",
      desc: "Extract structured headings, tables, and text into clean Markdown (.md).",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-markdown",
      icon: FileText,
    },
    {
      id: "pdf-to-json",
      name: "PDF to JSON",
      desc: "Extract structured JSON schema, page dimensions, and coordinates.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-json",
      icon: FileText,
    },
    {
      id: "pdf-whiteout",
      name: "PDF Whiteout & Redact",
      desc: "Erase confidential text or sensitive numbers with permanent vector redaction.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-whiteout",
      icon: FileText,
    },
    {
      id: "html-to-pdf",
      name: "HTML to PDF",
      desc: "Render raw HTML code, CSS stylesheets, and invoices into printable PDFs.",
      category: "pdf",
      status: "active",
      href: "/tools/html-to-pdf",
      icon: FileText,
    },
    {
      id: "repair-pdf",
      name: "Repair Corrupted PDF",
      desc: "Rebuild cross-reference tables and recover broken, unreadable PDF files.",
      category: "pdf",
      status: "active",
      href: "/tools/repair-pdf",
      icon: FileText,
    },
    {
      id: "pdf-to-pdfa",
      name: "PDF to PDF/A",
      desc: "Convert documents to ISO 19005 standard for legal and archival preservation.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-to-pdfa",
      icon: FileText,
    },
    {
      id: "compare-pdf",
      name: "Compare PDF",
      desc: "Side-by-side text diffing to spot changes between document revisions.",
      category: "pdf",
      status: "active",
      href: "/tools/compare-pdf",
      icon: FileText,
    },
    {
      id: "pdf-forms",
      name: "Create Fillable PDF Forms",
      desc: "Add interactive AcroForm text fields and checkboxes to static PDFs.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-forms",
      icon: FileText,
    },
    {
      id: "excel-to-pdf",
      name: "Excel to PDF",
      desc: "Convert XLSX, XLS, and CSV spreadsheets into formatted table PDFs.",
      category: "pdf",
      status: "active",
      href: "/tools/excel-to-pdf",
      icon: FileSpreadsheet,
    },
    {
      id: "translate-pdf",
      name: "Translate PDF",
      desc: "Translate PDF text into 12+ international languages directly in browser.",
      category: "pdf",
      status: "active",
      href: "/tools/translate-pdf",
      icon: FileText,
    },
    {
      id: "pdf-ai-summarizer",
      name: "AI PDF Summarizer",
      desc: "Condense long PDF reports into bullet points and executive summaries.",
      category: "pdf",
      status: "active",
      href: "/tools/pdf-ai-summarizer",
      icon: Sparkles,
    },

    // 3. Image Editing Tools
    {
      id: "img-crop",
      name: "Crop Image",
      desc: "Crop photos to custom dimensions or social media aspect ratios.",
      category: "image",
      status: "active",
      href: "/tools/image-crop",
      icon: ImageIcon,
    },
    {
      id: "img-resize",
      name: "Image Resizer",
      desc: "Scale image resolution by percentage or precise pixel widths.",
      category: "image",
      status: "active",
      href: "/tools/image-resize",
      icon: ImageIcon,
    },
    {
      id: "img-bg-remove",
      name: "AI Background Remover",
      desc: "Instantly isolate portraits and products with automatic cutout.",
      category: "image",
      status: "active",
      href: "/tools/image-remove-bg",
      icon: Sparkles,
    },
    {
      id: "img-convert",
      name: "Image Format Converter",
      desc: "Batch convert images between WebP, PNG, and JPG with custom quality.",
      category: "image",
      status: "active",
      href: "/tools/image-convert",
      icon: RefreshCw,
    },
    {
      id: "img-webp",
      name: "Image to WebP Converter",
      desc: "Convert heavy JPGs/PNGs to modern, lightweight WebP files.",
      category: "image",
      status: "active",
      href: "/tools/image-to-webp",
      icon: RefreshCw,
    },
    {
      id: "img-compress",
      name: "Image Compressor",
      desc: "Shrink image file sizes from MBs to KBs with zero visible artifacting.",
      category: "image",
      status: "active",
      href: "/tools/image-compress",
      icon: ImageIcon,
    },
    {
      id: "img-upscale",
      name: "Image Upscaler",
      desc: "Upscale image resolution (2x, 4x) using high-quality client-side interpolation.",
      category: "image",
      status: "active",
      href: "/tools/image-upscale",
      icon: Sparkles,
    },
    {
      id: "image-filters",
      name: "Photo Filters & Effects",
      desc: "Fine-tune brightness, contrast, saturation, and cinematic film presets.",
      category: "image",
      status: "active",
      href: "/tools/image-filters",
      icon: Sparkles,
    },
    {
      id: "image-rotate",
      name: "Rotate & Flip Image",
      desc: "Rotate photos 90°, 180°, 270° or mirror flip horizontally and vertically.",
      category: "image",
      status: "active",
      href: "/tools/image-rotate",
      icon: RefreshCw,
    },
    {
      id: "image-watermark",
      name: "Watermark Image",
      desc: "Add custom copyright text, custom opacity, and angles to protect photos.",
      category: "image",
      status: "active",
      href: "/tools/image-watermark",
      icon: ImageIcon,
    },
    {
      id: "image-to-base64",
      name: "Image to Base64",
      desc: "Convert JPG, PNG, and SVG images into Base64 strings and Data URIs.",
      category: "image",
      status: "active",
      href: "/tools/image-to-base64",
      icon: ImageIcon,
    },
    {
      id: "base64-to-image",
      name: "Base64 to Image",
      desc: "Decode Base64 strings and Data URIs into downloadable PNG or JPG files.",
      category: "image",
      status: "active",
      href: "/tools/base64-to-image",
      icon: ImageIcon,
    },
    {
      id: "image-color-picker",
      name: "Image Color Picker",
      desc: "Eyedropper tool to inspect exact HEX, RGB, and HSL codes and palettes.",
      category: "image",
      status: "active",
      href: "/tools/image-color-picker",
      icon: Sparkles,
    },

    // 4. Video Editing Tools
    {
      id: "video-trim",
      name: "Video Cutter / Trimmer",
      desc: "Cut unwanted start and end footage from any MP4/MOV clip with fast lossless stream copy or frame-accurate cut.",
      category: "video",
      status: "active",
      href: "/tools/video-trim",
      icon: Scissors,
    },
    {
      id: "video-speed",
      name: "Video Speed Controller",
      desc: "Slow motion (0.25x) or fast forward time-lapse (4.0x) adjustments with pitch-preserved audio.",
      category: "video",
      status: "active",
      href: "/tools/video-speed",
      icon: FileVideo,
    },
    {
      id: "video-to-mp3",
      name: "Audio Extractor (Video to MP3)",
      desc: "Strip background music or voiceovers into high-bitrate MP3 audio.",
      category: "video",
      status: "active",
      href: "/tools/video-to-mp3",
      icon: Music,
    },
    {
      id: "video-to-gif",
      name: "Video to GIF Maker",
      desc: "Convert MP4, WebM, and MOV videos into smooth animated GIFs.",
      category: "video",
      status: "active",
      href: "/tools/video-to-gif",
      icon: Film,
    },
    {
      id: "video-mute",
      name: "Mute & Reverse Video",
      desc: "Strip audio track losslessly or reverse video playback frames.",
      category: "video",
      status: "active",
      href: "/tools/video-mute",
      icon: Scissors,
    },
    {
      id: "video-compress",
      name: "Video Compressor",
      desc: "Reduce MP4 file sizes without losing 720p or 1080p resolution.",
      category: "video",
      status: "active",
      href: "/tools/video-compress",
      icon: FileVideo,
    },
    {
      id: "vid-aspect",
      name: "Aspect Ratio Converter",
      desc: "Reframe horizontal 16:9 YouTube videos into 9:16 TikTok Reels.",
      category: "video",
      status: "active",
      href: "/tools/video-editor?tool=aspect",
      icon: Scissors,
    },
    {
      id: "video-rotate",
      name: "Rotate & Flip Video",
      desc: "Rotate videos 90°, 180°, 270° or mirror flip horizontally and vertically.",
      category: "video",
      status: "active",
      href: "/tools/video-rotate",
      icon: RefreshCw,
    },
    {
      id: "video-filters",
      name: "Video Filters & Effects",
      desc: "Color grade, adjust brightness/contrast, and apply cinematic presets.",
      category: "video",
      status: "active",
      href: "/tools/video-filters",
      icon: Sparkles,
    },
    {
      id: "video-volume",
      name: "Adjust Video Volume",
      desc: "Boost quiet audio up to 500% or lower sound with lossless stream copy.",
      category: "video",
      status: "active",
      href: "/tools/video-volume",
      icon: Music,
    },
    {
      id: "video-convert",
      name: "Video Format Converter",
      desc: "Convert videos between MP4, WebM, MKV, MOV, and AVI containers.",
      category: "video",
      status: "active",
      href: "/tools/video-convert",
      icon: RefreshCw,
    },

    // 5. Converters & Compressors
    {
      id: "conv-zip",
      name: "ZIP File Compressor",
      desc: "Combine multiple files and folders into an encrypted ZIP archive.",
      category: "converters",
      status: "active",
      href: "/tools/zip-compressor",
      icon: RefreshCw,
    },
    {
      id: "conv-extract",
      name: "Archive (ZIP) Extractor",
      desc: "Open, inspect, preview, and extract files from ZIP archives in-browser.",
      category: "converters",
      status: "active",
      href: "/tools/extract-archive",
      icon: RefreshCw,
    },
    {
      id: "conv-audio",
      name: "Audio Format Converter",
      desc: "Convert audio files between MP3, WAV, AAC, OGG, and FLAC formats.",
      category: "converters",
      status: "active",
      href: "/tools/audio-converter",
      icon: Music,
    },
    {
      id: "audio-volume",
      name: "Adjust Audio Volume",
      desc: "Boost quiet MP3/WAV tracks up to 500% or lower sound without loss.",
      category: "converters",
      status: "active",
      href: "/tools/audio-volume",
      icon: Music,
    },
    {
      id: "audio-trim",
      name: "Audio Cutter & Trimmer",
      desc: "Cut unwanted audio segments and create ringtones with stream copy.",
      category: "converters",
      status: "active",
      href: "/tools/audio-trim",
      icon: Scissors,
    },
    {
      id: "gen-qr",
      name: "QR Code Generator",
      desc: "Generate customizable QR codes for websites, Wi-Fi, email, and phone.",
      category: "converters",
      status: "active",
      href: "/tools/generate-qr",
      icon: QrCode,
    },
    {
      id: "json-formatter",
      name: "JSON Formatter & Validator",
      desc: "Format, validate, beautify, and minify JSON with syntax verification.",
      category: "converters",
      status: "active",
      href: "/tools/json-formatter",
      icon: RefreshCw,
    },
    {
      id: "hash-generator",
      name: "Cryptographic Hash Generator",
      desc: "Generate SHA-256, SHA-512, and MD5 hashes via hardware WebCrypto.",
      category: "converters",
      status: "active",
      href: "/tools/hash-generator",
      icon: Lock,
    },
    {
      id: "password-generator",
      name: "Secure Password Generator",
      desc: "Create random high-entropy passwords with custom length and symbols.",
      category: "converters",
      status: "active",
      href: "/tools/password-generator",
      icon: Lock,
    },
    {
      id: "xml-formatter",
      name: "XML Formatter & Beautifier",
      desc: "Format, validate, beautify, and minify XML and SVG code in-browser.",
      category: "converters",
      status: "active",
      href: "/tools/xml-formatter",
      icon: RefreshCw,
    },
    {
      id: "html-formatter",
      name: "HTML Formatter & Beautifier",
      desc: "Beautify messy HTML templates or minify production code losslessly.",
      category: "converters",
      status: "active",
      href: "/tools/html-formatter",
      icon: Code,
    },
    // --- TEXT & CONTENT UTILITIES ---
    {
      id: "word-counter",
      name: "Word & Character Counter",
      desc: "Live character and word counts, reading time, and keyword density analysis.",
      category: "text",
      status: "active",
      href: "/tools/word-counter",
      icon: Type,
    },
    {
      id: "lorem-ipsum-generator",
      name: "Lorem Ipsum Dummy Text",
      desc: "Generate custom placeholder paragraphs, sentences, or words with HTML tags.",
      category: "text",
      status: "active",
      href: "/tools/lorem-ipsum-generator",
      icon: FileText,
    },
    {
      id: "case-converter",
      name: "Case Converter Online",
      desc: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.",
      category: "text",
      status: "active",
      href: "/tools/case-converter",
      icon: Type,
    },
    {
      id: "slug-generator",
      name: "SEO URL Slug Generator",
      desc: "Convert blog titles and headlines into clean, URL-safe permalinks.",
      category: "text",
      status: "active",
      href: "/tools/slug-generator",
      icon: Globe,
    },
    {
      id: "markdown-to-html",
      name: "Markdown to HTML Converter",
      desc: "Convert Markdown to clean HTML code with live real-time visual preview.",
      category: "text",
      status: "active",
      href: "/tools/markdown-to-html",
      icon: FileCode,
    },
    {
      id: "url-encoder-decoder",
      name: "URL Encoder & Decoder",
      desc: "RFC 3986 compliant URL and query parameter encoder and decoder.",
      category: "converters",
      status: "active",
      href: "/tools/url-encoder-decoder",
      icon: Link2,
    },
    {
      id: "diff-checker",
      name: "Text & Code Diff Checker",
      desc: "Compare two text snippets side-by-side to highlight additions and deletions.",
      category: "dev",
      status: "active",
      href: "/tools/diff-checker",
      icon: GitCompare,
    },
    {
      id: "duplicate-line-remover",
      name: "Duplicate Line Remover",
      desc: "Remove duplicate lines from text and lists with whitespace trimming options.",
      category: "text",
      status: "active",
      href: "/tools/duplicate-line-remover",
      icon: ListFilter,
    },
    {
      id: "text-sorter",
      name: "Text & List Sorter",
      desc: "Sort text lists alphabetically (A-Z), naturally (1, 2, 10), by length, or shuffle.",
      category: "text",
      status: "active",
      href: "/tools/text-sorter",
      icon: ArrowUpDown,
    },
    {
      id: "regex-tester",
      name: "Regular Expression (Regex) Tester",
      desc: "Test and debug JavaScript regular expressions with match highlighting and capture groups.",
      category: "dev",
      status: "active",
      href: "/tools/regex-tester",
      icon: Code2,
    },
    {
      id: "jwt-decoder",
      name: "JSON Web Token (JWT) Decoder",
      desc: "Safely decode and inspect JWT headers, payload claims, and token expiration dates.",
      category: "dev",
      status: "active",
      href: "/tools/jwt-decoder",
      icon: KeyRound,
    },
    {
      id: "html-entity-converter",
      name: "HTML Entity Encoder & Decoder",
      desc: "Convert special characters into HTML entities or decode entities back to text.",
      category: "dev",
      status: "active",
      href: "/tools/html-entity-converter",
      icon: Code,
    },
    // --- WEB DEV & CSS UTILITIES ---
    {
      id: "css-minifier",
      name: "CSS Minifier Online",
      desc: "Compress CSS stylesheets, strip comments, and calculate bandwidth savings.",
      category: "dev",
      status: "active",
      href: "/tools/css-minifier",
      icon: FileCode,
    },
    {
      id: "css-beautifier",
      name: "CSS Beautifier & Formatter",
      desc: "Format unindented or minified CSS with configurable 2 or 4-space indentations.",
      category: "dev",
      status: "active",
      href: "/tools/css-beautifier",
      icon: Code,
    },
    {
      id: "box-shadow-generator",
      name: "CSS Box Shadow Generator",
      desc: "Visually build soft realistic CSS box-shadows, inset glows, and elevation layers.",
      category: "dev",
      status: "active",
      href: "/tools/box-shadow-generator",
      icon: Layers,
    },
    {
      id: "gradient-generator",
      name: "CSS Gradient Generator",
      desc: "Design multi-stop linear and radial gradients with live previews and presets.",
      category: "dev",
      status: "active",
      href: "/tools/gradient-generator",
      icon: Palette,
    },
    {
      id: "px-to-rem-converter",
      name: "PX to REM Converter",
      desc: "Bidirectional pixel to REM/EM conversion calculator with custom root font sizes.",
      category: "dev",
      status: "active",
      href: "/tools/px-to-rem-converter",
      icon: Ruler,
    },
    {
      id: "svg-to-png",
      name: "SVG to PNG Converter",
      desc: "Convert scalable vector graphics into 1x, 2x Retina, and 4x PNG images in-browser.",
      category: "image",
      status: "active",
      href: "/tools/svg-to-png",
      icon: ImageIcon,
    },
    // --- DATA & CONVERSION UTILITIES ---
    {
      id: "csv-to-json",
      name: "CSV to JSON Converter",
      desc: "Convert CSV and TSV spreadsheets into structured JSON arrays of objects.",
      category: "converters",
      status: "active",
      href: "/tools/csv-to-json",
      icon: FileSpreadsheet,
    },
    {
      id: "json-to-csv",
      name: "JSON to CSV Converter",
      desc: "Export JSON arrays of objects to CSV or TSV spreadsheets with custom delimiters.",
      category: "converters",
      status: "active",
      href: "/tools/json-to-csv",
      icon: FileSpreadsheet,
    },
    {
      id: "uuid-generator",
      name: "Bulk UUID v4 Generator",
      desc: "Generate cryptographically secure random UUID v4 strings in bulk.",
      category: "dev",
      status: "active",
      href: "/tools/uuid-generator",
      icon: KeyRound,
    },
    {
      id: "timestamp-converter",
      name: "Unix Timestamp & Epoch Converter",
      desc: "Convert Unix epoch timestamps to UTC, ISO 8601, and local human dates.",
      category: "dev",
      status: "active",
      href: "/tools/timestamp-converter",
      icon: Clock,
    },
    {
      id: "markdown-table-generator",
      name: "Markdown Table Generator",
      desc: "Visual spreadsheet grid editor that generates clean GitHub-Flavored Markdown tables.",
      category: "text",
      status: "active",
      href: "/tools/markdown-table-generator",
      icon: Table,
    },
    {
      id: "base64-file-converter",
      name: "Base64 File Encoder & Decoder",
      desc: "Encode any file to Base64 Data URI or reconstruct binary files from Base64.",
      category: "converters",
      status: "active",
      href: "/tools/base64-file-converter",
      icon: Binary,
    },
    // --- SYSTEM, COLOR & DATABASE UTILITIES ---
    {
      id: "color-palette-generator",
      name: "AI Color Palette Generator",
      desc: "Generate trending color palettes and export to CSS variables or Tailwind tokens.",
      category: "dev",
      status: "active",
      href: "/tools/color-palette-generator",
      icon: Palette,
    },
    {
      id: "hex-to-rgb",
      name: "HEX to RGB & CMYK Converter",
      desc: "Convert color models between HEX, RGB, RGBA, HSL, and print-ready CMYK.",
      category: "dev",
      status: "active",
      href: "/tools/hex-to-rgb",
      icon: Pipette,
    },
    {
      id: "unit-converter",
      name: "Universal Unit Converter",
      desc: "High-precision conversion for digital storage (MB, GB, TB), length, weight, and temperature.",
      category: "converters",
      status: "active",
      href: "/tools/unit-converter",
      icon: Scale,
    },
    {
      id: "sql-formatter",
      name: "SQL Formatter & Beautifier",
      desc: "Beautify, indent, and format complex SQL queries with keyword capitalization.",
      category: "dev",
      status: "active",
      href: "/tools/sql-formatter",
      icon: Database,
    },
    {
      id: "yaml-to-json",
      name: "YAML to JSON Converter",
      desc: "Bidirectional YAML and JSON parser and serializer with nested list preservation.",
      category: "converters",
      status: "active",
      href: "/tools/yaml-to-json",
      icon: FileCode,
    },
    {
      id: "cron-generator",
      name: "Cron Expression Generator",
      desc: "Visually build 5-part cron schedules with plain English descriptions and presets.",
      category: "dev",
      status: "active",
      href: "/tools/cron-generator",
      icon: Clock,
    },
  ];

  const categories = [
    { id: "all", label: "All Tools (100+)" },
    { id: "ai", label: "AI Creative Suite" },
    { id: "video", label: "Video Tools" },
    { id: "image", label: "Image Tools" },
    { id: "pdf", label: "PDF Utilities" },
    { id: "converters", label: "Converters & Data" },
    { id: "text", label: "Text & Content" },
    { id: "dev", label: "Developer & CSS" },
  ];

  const filteredTools = tools.filter((t) => {
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Botock Tool Directory
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-3 mb-3">
          100+ Free Online Creative & Utility Tools
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Everything you need to create, convert, compress, and edit media in one place. No watermarks, no software installations required.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative mb-8">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search any tool (e.g. video cutter, PDF merge, background remover)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? "bg-primary text-white shadow-sm"
                : "border border-border/50 bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.status === "active";

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/40 transition-all group flex flex-col justify-between shadow-sm relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isActive ? "Live Now" : "Ready"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* AdSpace */}
      <AdBanner slotId="directory-bottom-ad" format="horizontal" />
    </div>
  );
}
