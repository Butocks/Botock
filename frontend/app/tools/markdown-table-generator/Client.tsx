"use client";

import { useState, useMemo } from "react";
import {
  Table,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";

export default function MarkdownTableGeneratorClient() {
  const [columns, setColumns] = useState<string[]>([
    "Feature",
    "Standard",
    "Pro Studio",
  ]);
  const [alignments, setAlignments] = useState<("left" | "center" | "right")[]>([
    "left",
    "center",
    "center",
  ]);
  const [rows, setRows] = useState<string[][]>([
    ["Client-Side Processing", "Yes", "Yes"],
    ["Resolution Output", "1080p", "4K Ultra HD"],
    ["Batch Conversion", "No", "Unlimited"],
    ["Server Charge", "0 Rs (Free)", "0 Rs (Free)"],
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate GitHub-flavored markdown table
  const markdownOutput = useMemo(() => {
    // 1. Calculate column widths
    const colWidths = columns.map((col, cIdx) => {
      let maxLen = col.length;
      for (const row of rows) {
        if (row[cIdx] && row[cIdx].length > maxLen) {
          maxLen = row[cIdx].length;
        }
      }
      return Math.max(maxLen, 3);
    });

    // 2. Format header
    const headerLine =
      "| " +
      columns
        .map((col, idx) => col.padEnd(colWidths[idx], " "))
        .join(" | ") +
      " |";

    // 3. Format divider
    const dividerLine =
      "| " +
      alignments
        .map((align, idx) => {
          const w = colWidths[idx];
          if (align === "center") {
            return ":" + "-".repeat(Math.max(1, w - 2)) + ":";
          } else if (align === "right") {
            return "-".repeat(Math.max(1, w - 1)) + ":";
          } else {
            return ":" + "-".repeat(Math.max(1, w - 1));
          }
        })
        .join(" | ") +
      " |";

    // 4. Format rows
    const rowLines = rows.map((row) => {
      return (
        "| " +
        columns
          .map((_, cIdx) => {
            const cell = row[cIdx] || "";
            return cell.padEnd(colWidths[cIdx], " ");
          })
          .join(" | ") +
        " |"
      );
    });

    return [headerLine, dividerLine, ...rowLines].join("\n");
  }, [columns, alignments, rows]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addColumn = () => {
    setColumns([...columns, `Column ${columns.length + 1}`]);
    setAlignments([...alignments, "left"]);
    setRows(rows.map((r) => [...r, ""]));
  };

  const removeColumn = (cIdx: number) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, idx) => idx !== cIdx));
    setAlignments(alignments.filter((_, idx) => idx !== cIdx));
    setRows(rows.map((r) => r.filter((_, idx) => idx !== cIdx)));
  };

  const addRow = () => {
    setRows([...rows, new Array(columns.length).fill("")]);
  };

  const removeRow = (rIdx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, idx) => idx !== rIdx));
  };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    const newRows = rows.map((row, r) => {
      if (r === rIdx) {
        const newRow = [...row];
        newRow[cIdx] = val;
        return newRow;
      }
      return row;
    });
    setRows(newRows);
  };

  const updateHeader = (cIdx: number, val: string) => {
    const newCols = [...columns];
    newCols[cIdx] = val;
    setColumns(newCols);
  };

  const toggleAlignment = (cIdx: number) => {
    const nextAlign: Record<string, "left" | "center" | "right"> = {
      left: "center",
      center: "right",
      right: "left",
    };
    const newAlignments = [...alignments];
    newAlignments[cIdx] = nextAlign[newAlignments[cIdx]];
    setAlignments(newAlignments);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Table className="w-3.5 h-3.5" />
            Markdown Grid Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Markdown Table Generator Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Design and edit GitHub-Flavored Markdown tables visually with cell alignments and instant copy.
          </p>
        </div>

        {/* Visual Table Editor */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <button
                onClick={addColumn}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Column
              </button>
              <button
                onClick={addRow}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
            </div>
            <span className="text-xs text-slate-500">
              {rows.length} rows × {columns.length} columns
            </span>
          </div>

          {/* Interactive Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {columns.map((col, cIdx) => (
                    <th key={cIdx} className="p-2 min-w-[160px]">
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={col}
                          onChange={(e) => updateHeader(cIdx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={() => toggleAlignment(cIdx)}
                          title={`Alignment: ${alignments[cIdx]}`}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-400"
                        >
                          {alignments[cIdx] === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                          {alignments[cIdx] === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                          {alignments[cIdx] === "right" && <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                        {columns.length > 1 && (
                          <button
                            onClick={() => removeColumn(cIdx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="p-2">
                        <input
                          type="text"
                          value={row[cIdx] || ""}
                          onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(rIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Markdown Output */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Generated Markdown Table
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Markdown!" : "Copy Markdown"}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-xs text-purple-300 whitespace-pre overflow-x-auto select-all">
            {markdownOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
