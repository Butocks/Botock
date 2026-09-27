"use client";

import { copyToClipboard } from "@/lib/utils/clipboard";
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
  Gauge,
  Maximize2,
  Box,
  Timer,
  Zap,
  Compass,
} from "lucide-react";

type UnitCategory =
  | "digital"
  | "length"
  | "weight"
  | "temperature"
  | "speed"
  | "area"
  | "volume"
  | "time"
  | "pressure"
  | "energy"
  | "angle";

interface UnitDef {
  id: string;
  name: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNITS_DATA: Record<
  UnitCategory,
  {
    name: string;
    icon: any;
    units: UnitDef[];
  }
> = {
  digital: {
    name: "Digital Storage",
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
      { id: "nmi", name: "Nautical Miles", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
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
      { id: "st", name: "Stone (st)", toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
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
  speed: {
    name: "Speed & Velocity",
    icon: Gauge,
    units: [
      { id: "kmh", name: "Kilometers / Hour (km/h)", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: "mph", name: "Miles / Hour (mph)", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: "ms", name: "Meters / Second (m/s)", toBase: (v) => v, fromBase: (v) => v },
      { id: "kn", name: "Knots (kn)", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { id: "fts", name: "Feet / Second (ft/s)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "mach", name: "Mach (Speed of Sound)", toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
    ],
  },
  area: {
    name: "Area & Surface",
    icon: Maximize2,
    units: [
      { id: "sqm", name: "Square Meters (m²)", toBase: (v) => v, fromBase: (v) => v },
      { id: "sqkm", name: "Square Kilometers (km²)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: "sqft", name: "Square Feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: "sqyd", name: "Square Yards (yd²)", toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
      { id: "acre", name: "Acres (ac)", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: "ha", name: "Hectares (ha)", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { id: "sqmi", name: "Square Miles (mi²)", toBase: (v) => v * 2589988.11, fromBase: (v) => v / 2589988.11 },
    ],
  },
  volume: {
    name: "Volume & Liquid",
    icon: Box,
    units: [
      { id: "l", name: "Liters (L)", toBase: (v) => v, fromBase: (v) => v },
      { id: "ml", name: "Milliliters (mL)", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: "gal_us", name: "US Gallons (gal)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: "gal_uk", name: "Imperial Gallons", toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
      { id: "cup", name: "Cups (US)", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: "floz", name: "Fluid Ounces (fl oz)", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: "cbm", name: "Cubic Meters (m³)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  time: {
    name: "Time Intervals",
    icon: Timer,
    units: [
      { id: "s", name: "Seconds (s)", toBase: (v) => v, fromBase: (v) => v },
      { id: "ms", name: "Milliseconds (ms)", toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: "min", name: "Minutes (min)", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: "hr", name: "Hours (hr)", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: "day", name: "Days (d)", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: "wk", name: "Weeks (wk)", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: "yr", name: "Years (yr, 365d)", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
  pressure: {
    name: "Pressure",
    icon: Gauge,
    units: [
      { id: "pa", name: "Pascals (Pa)", toBase: (v) => v, fromBase: (v) => v },
      { id: "kpa", name: "Kilopascals (kPa)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "bar", name: "Bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: "psi", name: "PSI (lbf/in²)", toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      { id: "atm", name: "Standard Atmosphere (atm)", toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: "torr", name: "Torr / mmHg", toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
    ],
  },
  energy: {
    name: "Energy & Work",
    icon: Zap,
    units: [
      { id: "j", name: "Joules (J)", toBase: (v) => v, fromBase: (v) => v },
      { id: "kj", name: "Kilojoules (kJ)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "cal", name: "Calories (cal)", toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: "kcal", name: "Kilocalories (kcal)", toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { id: "wh", name: "Watt-hours (Wh)", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: "kwh", name: "Kilowatt-hours (kWh)", toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      { id: "btu", name: "BTU", toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
    ],
  },
  angle: {
    name: "Angles",
    icon: Compass,
    units: [
      { id: "deg", name: "Degrees (°)", toBase: (v) => v, fromBase: (v) => v },
      { id: "rad", name: "Radians (rad)", toBase: (v) => (v * 180) / Math.PI, fromBase: (v) => (v * Math.PI) / 180 },
      { id: "grad", name: "Gradians (grad)", toBase: (v) => (v * 180) / 200, fromBase: (v) => (v * 200) / 180 },
      { id: "arcmin", name: "Arcminutes (′)", toBase: (v) => v / 60, fromBase: (v) => v * 60 },
      { id: "arcsec", name: "Arcseconds (″)", toBase: (v) => v / 3600, fromBase: (v) => v * 3600 },
    ],
  },
};

export default function UnitConverterClient() {
  const [category, setCategory] = useState<UnitCategory>("digital");
  const [fromUnit, setFromUnit] = useState<string>("GB");
  const [toUnit, setToUnit] = useState<string>("MB");
  const [inputValue, setInputValue] = useState<string>("1");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentCategoryUnits = UNITS_DATA[category].units;

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNITS_DATA[newCat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1] ? units[1].id : units[0].id);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

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

  // All units comparison matrix
  const allConversions = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return [];

    const fromDef = currentCategoryUnits.find((u) => u.id === fromUnit) || currentCategoryUnits[0];
    const baseVal = fromDef.toBase(num);

    return currentCategoryUnits.map((u) => {
      const val = u.fromBase(baseVal);
      let formatted = "";
      if (Math.abs(val) >= 1e-4 && Math.abs(val) < 1e12) {
        formatted = Number(val.toFixed(6)).toString();
      } else {
        formatted = val.toExponential(4);
      }
      return {
        unit: u,
        value: formatted,
      };
    });
  }, [inputValue, fromUnit, currentCategoryUnits]);

  const handleCopy = (val: string, key = "main") => {
    if (!val) return;
    copyToClipboard(val);
    if (key === "main") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5" />
            Universal Measurement Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Universal Unit Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Precision mathematical conversions across 11 physical, digital, temporal, and thermodynamic dimensions.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          {(Object.keys(UNITS_DATA) as UnitCategory[]).map((cat) => {
            const data = UNITS_DATA[cat];
            const Icon = data.icon;
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{data.name}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Converter Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* From */}
            <div className="md:col-span-3 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                From
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl font-mono text-xl font-bold text-white focus:outline-none focus:border-purple-500"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {currentCategoryUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <button
                onClick={handleSwap}
                title="Swap Units"
                className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white flex items-center justify-center transition shadow-md cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  To (Result)
                </label>
                {convertedValue && (
                  <button
                    onClick={() => handleCopy(convertedValue, "main")}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div className="w-full px-4 py-3 bg-slate-950 border border-purple-500/40 rounded-xl font-mono text-xl font-extrabold text-purple-300 min-h-[52px] flex items-center break-all select-all">
                {convertedValue || "—"}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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

        {/* Multi-Unit Conversion Matrix */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {UNITS_DATA[category].name} Instant Conversion Matrix
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Equivalent to {inputValue || 0} {fromUnit}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allConversions.map(({ unit, value }) => {
              const isSelected = unit.id === toUnit;
              return (
                <div
                  key={unit.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    isSelected
                      ? "bg-purple-950/30 border-purple-500/50"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="overflow-hidden mr-2">
                    <span className="text-xs font-medium text-slate-400 block truncate">
                      {unit.name}
                    </span>
                    <span className="text-sm font-mono font-bold text-purple-300 block truncate">
                      {value}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(value, unit.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                  >
                    {copiedKey === unit.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
