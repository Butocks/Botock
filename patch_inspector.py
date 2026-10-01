import re

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# Add TransformInspector import
if "TransformInspector" not in content:
    content = content.replace(
        'import PreviewCanvas from "./components/PreviewCanvas";',
        'import PreviewCanvas from "./components/PreviewCanvas";\nimport TransformInspector from "./components/TransformInspector";'
    )

# Find selectedClip
if "const selectedClip =" not in content:
    content = content.replace(
        'const currentMaxTime =',
        'const selectedClip = timeline.project.tracks.flatMap(t => t.clips).find(c => c.id === timeline.selectedClipId);\n  const currentMaxTime ='
    )

# Inject Inspector panel after Preview Area (before the closing div of the Top Panel)
# The top panel ends right before {/* Bottom Panel: Timeline */}
inspector_html = """
             {/* Inspector Area */}
             {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image") && (
                 <div className="w-[280px] bg-[#141419] border-l border-[#2b2b36] flex flex-col min-h-0 overflow-y-auto shrink-0 shadow-xl">
                    <TransformInspector 
                        clip={selectedClip} 
                        onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                        onBeginLive={() => timeline.beginLiveUpdate()}
                        onCommitLive={() => timeline.commitLiveUpdate(selectedClip.id)}
                        onUpdate={(patch) => {
                            timeline.beginLiveUpdate();
                            timeline.updateClipLive(selectedClip.id, patch);
                            timeline.commitLiveUpdate(selectedClip.id);
                        }}
                    />
                 </div>
             )}
"""

content = content.replace(
    '          {/* Bottom Panel: Timeline */}',
    inspector_html + '\n          </div>\n\n          {/* Bottom Panel: Timeline */}'
)
# We also need to remove the closing </div> that was originally right before {/* Bottom Panel: Timeline */}
content = content.replace(
    '             </div>\n' + inspector_html,
    '             </div>\n' + inspector_html.replace('\n          </div>\n', '')
)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)

