"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Headphones, Sparkles, Download, AlertCircle } from "lucide-react";
import { getBackendUrl } from "../../../utils/runtime-urls";
import { getTransferMedia } from "@/app/utils/mediaTransfer";

export default function AudioEnhanceClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const checkTransfer = async () => {
      try {
        const media = await getTransferMedia();
        if (mounted && media && media.file) {
          setSelectedFile(media.file);
        }
      } catch (err) {
        console.error("Error auto-loading transfer media in audio enhance:", err);
      }
    };
    checkTransfer();
    return () => { mounted = false; };
  }, []);

  const startProcessing = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMessage("");
    setAudioUrl(null);

    try {
      const backendUrl = await getBackendUrl();
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch(`${backendUrl}/api/convert/audio-enhance`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setStatus("completed");
          return;
        } else {
          const errData = await response.json().catch(() => null);
          if (response.status !== 502 && errData?.detail) {
            throw new Error(errData.detail);
          }
        }
      } catch (backendErr: any) {
        console.warn("Backend audio enhancer unavailable, using browser Web Audio pipeline:", backendErr);
      }

      // Fast, offline-capable browser audio enhance fallback
      const enhancedBlob = await enhanceAudioInBrowser(selectedFile);
      const url = URL.createObjectURL(enhancedBlob);
      setAudioUrl(url);
      setStatus("completed");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during audio processing.");
      setStatus("error");
    }
  };

  const enhanceAudioInBrowser = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    const offlineCtx = new OfflineAudioContext(
      decoded.numberOfChannels,
      decoded.length,
      decoded.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;

    // Highpass filter to eliminate low-frequency rumble below 80Hz
    const highpass = offlineCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 80;

    // Lowpass filter to eliminate high-frequency hiss above 12kHz
    const lowpass = offlineCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 12000;

    // Dynamic speech compressor to balance voice levels
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 20;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.2;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(offlineCtx.destination);

    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    // Encode renderedBuffer to standard WAV format
    return bufferToWave(renderedBuffer);
  };

  const bufferToWave = (abuffer: AudioBuffer): Blob => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = abuffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // 16 for PCM
    setUint16(1); // Linear quantization (PCM)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Data sub-chunk
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < abuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out.buffer], { type: "audio/wav" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
            <Headphones className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Audio Enhancer</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Upload your audio or video file to remove background noise and enhance speech.
          </p>
        </div>

        <div className="space-y-6">
          {!selectedFile ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer bg-muted/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="audio/*,video/*" className="hidden" />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Audio/Video</h3>
              <p className="text-xs text-muted-foreground">MP3, WAV, MP4, MOV (Max 50MB)</p>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500">Remove</button>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={startProcessing}
              disabled={status === "uploading"}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all"
            >
              {status === "uploading" ? (
                <>Removing Noise...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Enhance Audio</>
              )}
            </button>
          )}

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {audioUrl && status === "completed" && (
            <div className="pt-6 text-center">
              <audio controls src={audioUrl} className="w-full mx-auto max-w-md mb-4" />
              <a href={audioUrl} download="botock_enhanced.wav" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">
                <Download className="w-4 h-4" /> Download Enhanced Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
