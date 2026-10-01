with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# 1. Remove the incorrectly placed overlay
bad_injection = """
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
content = content.replace(bad_injection, "")

# 2. Add it correctly inside Preview Area, wrapped in a relative container with aspectRatio
old_canvas = """                   <PreviewCanvas
                     project={timeline.project}
                     mediaItems={mediaBin.items}
                     currentTime={currentTime}
                     isPlaying={isPlaying}
                   />"""

new_canvas_and_overlay = """                   <div className="relative max-w-full max-h-full" style={{ aspectRatio: `${timeline.project.width} / ${timeline.project.height}` }}>
                      <PreviewCanvas
                        project={timeline.project}
                        mediaItems={mediaBin.items}
                        currentTime={currentTime}
                        isPlaying={isPlaying}
                      />
                      {selectedClip && (selectedClip.type === "video" || selectedClip.type === "image") && (
                         <TransformOverlay
                            clip={selectedClip}
                            project={timeline.project}
                            mediaItem={mediaBin.items.find(m => m.id === selectedClip.sourceId)}
                            onUpdateLive={(patch) => timeline.updateClipLive(selectedClip.id, patch)}
                            onCommitLive={() => timeline.commitLiveUpdate()}
                         />
                      )}
                   </div>"""

content = content.replace(old_canvas, new_canvas_and_overlay)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
