with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

if "TransformOverlay" not in content:
    content = content.replace(
        'import TransformInspector from "./components/TransformInspector";',
        'import TransformInspector from "./components/TransformInspector";\nimport TransformOverlay from "./components/TransformOverlay";'
    )

overlay_code = """
                   {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image") && (
                      <TransformOverlay
                         clip={selectedClip}
                         project={timeline.project}
                         mediaItem={mediaBin.items.find(m => m.id === selectedClip.sourceId)}
                         onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                         onCommitLive={() => timeline.commitLiveUpdate()}
                      />
                   )}
"""

content = content.replace(
    '                   />\n                </div>\n             </div>',
    '                   />\n' + overlay_code + '\n                </div>\n             </div>'
)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
