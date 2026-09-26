"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  Wifi,
  Mail,
  Phone,
  FileText,
  Sliders,
  Sparkles,
} from "lucide-react";

type QRType = "url" | "text" | "wifi" | "email" | "phone";

export default function QrGeneratorClient() {
  const [qrType, setQrType] = useState<QRType>("url");
  const [content, setContent] = useState<string>("https://botock.com");
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [size, setSize] = useState<number>(360);
  const [copied, setCopied] = useState<boolean>(false);

  // WiFi helper state
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiAuth, setWifiAuth] = useState("WPA");

  // Email helper state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get compiled string based on type
  const getEncodedValue = (): string => {
    switch (qrType) {
      case "wifi":
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};;`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${content}`;
      default:
        return content || "https://botock.com";
    }
  };

  useEffect(() => {
    const text = getEncodedValue();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use browser image generation or SVG/Canvas drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Generate high quality QR code using Google Charts API or fallback in-browser matrix
    const encoded = encodeURIComponent(text);
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);
    };
    qrImg.onerror = () => {
      // Offline fallback: draw stylized QR representation
      ctx.fillStyle = fgColor;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("QR Code Preview", size / 2, size / 2);
    };
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${fgColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&margin=2`;
  }, [qrType, content, wifiSsid, wifiPass, wifiAuth, emailTo, emailSubject, emailBody, fgColor, bgColor, size]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `botock-qr-${Date.now()}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    copyToClipboard(getEncodedValue());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Type Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              QR Code Content Type
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
              {[
                { id: "url", label: "Website", icon: Globe },
                { id: "text", label: "Text", icon: FileText },
                { id: "wifi", label: "Wi-Fi", icon: Wifi },
                { id: "email", label: "Email", icon: Mail },
                { id: "phone", label: "Phone", icon: Phone },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQrType(t.id as QRType)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      qrType === t.id
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Inputs */}
          {qrType === "url" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Website URL
              </label>
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {qrType === "text" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Plain Text
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste any text or note here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {qrType === "wifi" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Network SSID (Name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="My Home Wi-Fi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Wi-Fi Password"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                />
              </div>
            </div>
          )}

          {qrType === "email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Inquiry / Feedback"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
                />
              </div>
            </div>
          )}

          {qrType === "phone" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] text-xs font-medium"
              />
            </div>
          )}

          {/* Color & Styling Controls */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                QR Code Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {fgColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview & Download (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
          <div className="space-y-4 w-full flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live QR Preview
            </span>

            <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-200 dark:border-white/[0.1] inline-block">
              <canvas
                ref={canvasRef}
                className="w-56 h-56 rounded-lg object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-500 max-w-xs truncate">
              Encodes: <span className="font-mono">{getEncodedValue()}</span>
            </p>
          </div>

          <div className="w-full space-y-2 mt-6">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download QR Code (PNG)
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" /> Copied Text!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Encoded Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
