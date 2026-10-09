"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Image as ImageIcon, Download, RotateCw, Trash2, RefreshCcw } from "lucide-react";

export default function ImageCropClient() {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

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

  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        setCroppedImage(canvas.toDataURL("image/png", 1.0));
      }
    }
  };

  const handleRotate = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(90);
    }
  };

  const changeAspectRatio = (ratio: number | undefined) => {
    setAspectRatio(ratio);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(ratio === undefined ? NaN : ratio);
    }
  };

  const resetImage = () => {
    setImage(null);
    setCroppedImage(null);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
      {!image ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* Aspect Ratio Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-slate-500 mr-2">Aspect Ratio:</span>
              {[
                { label: "Free", value: undefined },
                { label: "Square (1:1)", value: 1 },
                { label: "Landscape (16:9)", value: 16 / 9 },
                { label: "Portrait (9:16)", value: 9 / 16 },
                { label: "Standard (4:3)", value: 4 / 3 }
              ].map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => changeAspectRatio(ratio.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    aspectRatio === ratio.value 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] p-2">
              <Cropper
                src={image}
                style={{ height: 400, width: "100%" }}
                aspectRatio={aspectRatio}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                checkOrientation={false}
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleRotate}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <RotateCw className="w-4 h-4" /> Rotate 90°
              </button>
              <button
                onClick={resetImage}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Start Over
              </button>
            </div>
          </div>

          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.08] pt-6 lg:pt-0 lg:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-emerald-500" /> Process Output
            </h3>
            
            <button
              onClick={handleCrop}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 mb-6 flex items-center justify-center gap-2"
            >
              Apply Crop & Preview
            </button>

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
          </div>
        </div>
      )}
    </div>
  );
}
