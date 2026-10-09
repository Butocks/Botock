const fs = require('fs');

let code = fs.readFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', 'utf8');

// 1. Remove Sidebar code
code = code.replace(/const SIDEBAR_ITEMS = \[[\s\S]*?\];/g, '');
code = code.replace(/const SIDEBAR_ITEMS_IDS = \[[\s\S]*?\];/g, '');

// 2. Remove Left Toolbar JSX
code = code.replace(/\{\/\* Left Toolbar \*\/\}\n\s*<div className="w-full md:w-20 bg-\[#141419\] flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 gap-2 md:gap-6 shrink-0 border-b md:border-r border-\[#2b2b36\] overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto">[\s\S]*?<\/div>/, '');

// 3. Remove activeTab state
code = code.replace(/const \[activeTab, setActiveTab\] = useState[^;]+;\n/g, '');
code = code.replace(/const handleTabChange = [\s\S]*?;\n/g, '');

// 4. Update the Inspector render to remove activeTab prop and add fallback for no clip selected
const oldInspector = `             <div className="w-full md:w-[280px] flex bg-[#141419] border-t md:border-l md:border-t-0 border-[#2b2b36] flex-col min-h-0 h-[250px] md:h-auto overflow-y-auto shrink-0 shadow-xl">
                {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image" || selectedClip.type === "text") ? (
                   <TransformInspector 
                       clip={selectedClip} 
                       activeTab={activeTab}
                       onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                       onBeginLive={() => timeline.beginLiveUpdate()}
                       onCommitLive={() => timeline.commitLiveUpdate()}
                       onUpdate={(patch) => {
                           timeline.beginLiveUpdate();
                           timeline.updateClipLive(selectedClip.id, patch);
                           timeline.commitLiveUpdate();
                       }}
                   />
                ) : (
                   <div className="flex-1 flex items-center justify-center text-xs text-gray-500 italic p-4 text-center">
                      Select a video or image clip in the timeline to view properties.
                   </div>
                )}
             </div>`;

const newInspector = `             {/* Contextual Right Inspector */}
             <div className="w-full md:w-[320px] flex bg-[#141419] border-t md:border-l md:border-t-0 border-[#2b2b36] flex-col min-h-0 h-[250px] md:h-auto overflow-y-auto shrink-0 shadow-xl">
                {selectedClip ? (
                   <TransformInspector 
                       clip={selectedClip}
                       onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                       onBeginLive={() => timeline.beginLiveUpdate()}
                       onCommitLive={() => timeline.commitLiveUpdate()}
                       onUpdate={(patch) => {
                           timeline.beginLiveUpdate();
                           timeline.updateClipLive(selectedClip.id, patch);
                           timeline.commitLiveUpdate();
                       }}
                   />
                ) : (
                   <div className="flex flex-col h-full bg-[#141419]">
                      <div className="p-3 border-b border-[#2b2b36] flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#ff6b4a]" />
                        <h2 className="text-xs font-bold text-white">Project Settings</h2>
                      </div>
                      <div className="p-4 space-y-6">
                        <div>
                           <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Aspect Ratio</h4>
                           <select 
                              value={\`\${timeline.project.width}x\${timeline.project.height}\`}
                              onChange={(e) => {
                                 const [w, h] = e.target.value.split("x").map(Number);
                                 timeline.beginLiveUpdate();
                                 // Dispatch event for project update
                                 window.dispatchEvent(new CustomEvent('editor-update-project', { detail: { width: w, height: h } }));
                                 timeline.commitLiveUpdate();
                              }}
                              className="w-full bg-[#0a0a0c] text-xs p-2 rounded border border-[#2b2b36] text-white outline-none"
                           >
                             <option value="1280x720">16:9 Landscape (YouTube)</option>
                             <option value="720x1280">9:16 Vertical (TikTok/Reels)</option>
                             <option value="1080x1080">1:1 Square (Instagram)</option>
                           </select>
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Export Format</h4>
                           <div className="bg-[#2b2b36] p-3 rounded text-xs text-gray-300">
                              <p>Video: MP4 (H.264)</p>
                              <p>Audio: AAC Stereo</p>
                              <p>Resolution: {timeline.project.width} x {timeline.project.height}</p>
                           </div>
                        </div>
                        <div className="pt-4 border-t border-[#2b2b36]">
                           <button onClick={handleExport} disabled={isExporting} className="w-full bg-[#ff6b4a] hover:bg-[#ff8266] text-white font-bold py-2.5 rounded text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                              {isExporting ? "Rendering..." : "Export Video"}
                           </button>
                        </div>
                      </div>
                   </div>
                )}
             </div>`;
             
code = code.replace(oldInspector, newInspector);

// Also remove the Aspect Ratio select from the Top Header
code = code.replace(/<select[\s\S]*?<\/select>/, '');

fs.writeFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', code);
