"use client";

import { useState, useMemo } from "react";
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  AlignLeft,
} from "lucide-react";

export default function SqlFormatterClient() {
  const [sqlInput, setSqlInput] = useState(
    `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.total_amount) as total_revenue from users u left join orders o on u.id = o.user_id where u.active = 1 and o.status in ('completed', 'shipped') group by u.id, u.name, u.email having sum(o.total_amount) > 1000 order by total_revenue desc limit 50;`
  );
  const [uppercaseKeywords, setUppercaseKeywords] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedSql = useMemo(() => {
    if (!sqlInput.trim()) return "";

    const keywords = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "LEFT JOIN", "RIGHT JOIN",
      "INNER JOIN", "OUTER JOIN", "JOIN", "ON", "GROUP BY", "HAVING",
      "ORDER BY", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE",
      "SET", "DELETE FROM", "UNION ALL", "UNION", "AS", "IN", "IS NULL",
      "IS NOT NULL", "LIKE", "BETWEEN", "CASE", "WHEN", "THEN", "ELSE",
      "END", "DESC", "ASC", "COUNT", "SUM", "AVG", "MIN", "MAX"
    ];

    // Top-level line breaking clauses
    const clauseBreaks = [
      "SELECT", "FROM", "WHERE", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
      "JOIN", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET",
      "SET", "VALUES"
    ];

    let query = sqlInput.replace(/\s+/g, " ").trim();

    // Capitalize or lowercase keywords
    keywords.forEach((kw) => {
      const reg = new RegExp(`\\b${kw}\\b`, "gi");
      query = query.replace(reg, uppercaseKeywords ? kw : kw.toLowerCase());
    });

    const indent = " ".repeat(indentSize);

    clauseBreaks.forEach((clause) => {
      const kw = uppercaseKeywords ? clause : clause.toLowerCase();
      const reg = new RegExp(`\\s+${clause}\\s+`, "gi");
      query = query.replace(reg, `\n${kw} `);
    });

    // Handle AND, OR on new line with indent
    const andKw = uppercaseKeywords ? "AND" : "and";
    const orKw = uppercaseKeywords ? "OR" : "or";
    query = query.replace(new RegExp(`\\s+${andKw}\\s+`, "gi"), `\n${indent}${andKw} `);
    query = query.replace(new RegExp(`\\s+${orKw}\\s+`, "gi"), `\n${indent}${orKw} `);

    // Format commas in SELECT clause
    return query.trim();
  }, [sqlInput, uppercaseKeywords, indentSize]);

  const handleCopy = () => {
    if (!formattedSql) return;
    navigator.clipboard.writeText(formattedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSql], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query.sql";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-purple-500/20 selection:text-purple-400">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Database className="w-3.5 h-3.5" />
            Database Query Beautifier
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SQL Formatter & Beautifier Online
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
            Clean, format, and indent unorganized SQL queries with keyword casing and clause alignments.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={uppercaseKeywords}
                onChange={(e) => setUppercaseKeywords(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
              />
              UPPERCASE Keywords (SELECT, WHERE, JOIN)
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Indent:</span>
              <button
                onClick={() => setIndentSize(2)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  indentSize === 2
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  indentSize === 4
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                4 Spaces
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!formattedSql}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy SQL"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!formattedSql}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Download .sql
            </button>
          </div>
        </div>

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unformatted Query
              </span>
              <button
                onClick={() => setSqlInput("")}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="Paste raw SQL query here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Formatted SQL Query
              </span>
            </div>
            <textarea
              readOnly
              value={formattedSql}
              placeholder="Beautified SQL query will appear here..."
              className="w-full flex-1 bg-transparent text-purple-300 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
