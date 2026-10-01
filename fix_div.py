with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

content = content.replace(
    """                   <PreviewCanvas
                     project={timeline.project}
                     mediaItems={timeline.mediaItems}
                     currentTime={currentTime}
                     isPlaying={isPlaying}
                   />
             {/* Inspector Area */}""",
    """                   <PreviewCanvas
                     project={timeline.project}
                     mediaItems={timeline.mediaItems}
                     currentTime={currentTime}
                     isPlaying={isPlaying}
                   />
                </div>
             </div>
             {/* Inspector Area */}"""
)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
