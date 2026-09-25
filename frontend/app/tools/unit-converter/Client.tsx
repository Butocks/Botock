"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  HardDrive,
  Ruler,
  Thermometer,
} from "lucide-react";

type UnitCategory = "digital" | "length" | "weight" | "temperature";

const UNITS_DATA: Record<
  UnitCategory,
  {
    name: string;
    icon: any;
    units: { id: string; name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
  }
> = {
  digital: {
    name: "Digital Data Storage",
    icon: HardDrive,
    units: [
      { id: "B", name: "Bytes (B)", toBase: (v) => v, fromBase: (v) => v },
      { id: "KB", name: "Kilobytes (KB)", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: "MB", name: "Megabytes (MB)", toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
      { id: "GB", name: "Gigabytes (GB)", toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
      { id: "TB", name: "Terabytes (TB)", toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
      { id: "PB", name: "Petabytes (PB)", toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
    ],
  },
  length: {
    name: "Length & Distance",
    icon: Ruler,
    units: [
      { id: "m", name: "Meters (m)", toBase: (v) => v, fromBase: (v) => v },
      { id: "km", name: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "cm", name: "Centimeters (cm)", toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
      { id: "mm", name: "Millimeters (mm)", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: "mi", name: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: "yd", name: "Yards (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: "ft", name: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "in", name: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ],
  },
  weight: {
    name: "Weight & Mass",
    icon: Scale,
    units: [
      { id: "kg", name: "Kilograms (kg)", toBase: (v) => v, fromBase: (v) => v },
      { id: "g", name: "Grams (g)", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: "mg", name: "Milligrams (mg)", toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6 },
      { id: "lb", name: "Pounds (lb)", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: "oz", name: "Ounces (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: "t", name: "Metric Ton (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  temperature: {
    name: "Temperature",
    icon: Thermometer,
    units: [
      { id: "C", name: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
      { id: "F", name: "Fahrenheit (°F)", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: "K", name: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
};

export default function UnitConverterClient() {
  const [category, setCategory] = useState<UnitCategory>("digital");
  const [fromUnit, setFromUnit] = useState<string>("GB");
  const [toUnit, setToUnit] = useState<string>("MB");
  const [inputValue, setInputValue] = useState<string>("1");
  const [copied, setCopied] = useState<boolean>(false);

  const currentCategoryUnits = UNITS_DATA[category].units;

  const convertedValue = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";

    const fromDef = currentCategoryUnits.find((u) => u.id === fromUnit) || currentCategoryUnits[0];
    const toDef = currentCategoryUnits.find((u) => u.id === toUnit) || currentCategoryUnits[1];

    const baseVal = fromDef.toBase(num);
    const targetVal = toDef.fromBase(baseVal);

    if (Math.abs(targetVal) >= 1e-4 && Math.abs(targetVal) < 1e12) {
      return Number(targetVal.toFixed(6)).toString();
    }
    return targetVal.toExponential(4);
  }, [inputValue, fromUnit, toUnit, currentCategoryUnits]);

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const units = UNITS_DATA[cat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1].id);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    if (!convertedValue) return;
    navigator.clipboard.writeText(`${convertedValue} ${toUnit}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5" />
            Precision Unit Matrix
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Universal Unit Converter Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Convert digital storage, length, mass, and temperature units with zero latency.
          </p>
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(["digital", "length", "weight", "temperature"] as const).map((cat) => {
            const data = UNITS_DATA[cat];
            const Icon = data.icon;
            const isActive = category === cat;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold shadow-lg shadow-purple-600/20"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className="w-5 h-5 text-purple-400" />
                <span className="text-xs">{data.name}</span>
              </button>
            );
          })}
        </div>

        {/* Converter Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 mb-8 shadow-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            {/* From Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block">
                From
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl font-mono text-xl font-bold text-white focus:outline-none focus:border-purple-500 transition"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {currentCategoryUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-3 rounded-full bg-slate-800 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-purple-300 transition shadow-lg cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 rotate-90 md:rotate-0" />
              </button>
            </div>

            {/* To Output */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase text-slate-400 font-semibold tracking-wider block">
                  To (Result)
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!convertedValue}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl font-mono text-xl font-bold text-purple-300 min-h-[50px] flex items-center overflow-x-auto select-all">
                {convertedValue || "0"}
              </div>

              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {currentCategoryUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
