with open("frontend/app/tools/video-editor/components/TransformInspector.tsx", "r") as f:
    content = f.read()

# We will add an Audio section below Transform settings
audio_section = """
      {/* Audio Settings */}
      {(clip.type === "video" || clip.type === "audio") && (
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audio</h3>
            <button
              onClick={() => onUpdateLive({ audio: { ...clip.audio, muted: !(clip.audio?.muted ?? false) } as any })}
              className={`p-1.5 rounded ${clip.audio?.muted ? "bg-red-500/20 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {clip.audio?.muted ? (
                   <>
                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                     <line x1="23" y1="9" x2="17" y2="15"></line>
                     <line x1="17" y1="9" x2="23" y2="15"></line>
                   </>
                ) : (
                   <>
                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                     <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                     <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                   </>
                )}
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Volume</span>
                <span>{Math.round(clip.audio?.volumePercent ?? 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={clip.audio?.volumePercent ?? 100}
                onChange={(e) => onUpdateLive({ audio: { ...clip.audio, volumePercent: parseFloat(e.target.value) } as any })}
                onPointerUp={onCommitLive}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
"""

content = content.replace(
    '    </div>\n  );\n}',
    audio_section + '    </div>\n  );\n}'
)

with open("frontend/app/tools/video-editor/components/TransformInspector.tsx", "w") as f:
    f.write(content)
