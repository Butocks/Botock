with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# Add import
if "PreviewCanvas" not in content:
    content = content.replace(
        'import EditorTimeline from "./components/EditorTimeline";',
        'import EditorTimeline from "./components/EditorTimeline";\nimport PreviewCanvas from "./components/PreviewCanvas";'
    )

# Replace the video tag
old_video_tag = """<video controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}
                     ref={videoRef}
                     className="max-w-full max-h-full bg-black shadow-2xl ring-1 ring-white/10"
                     style={{
                        aspectRatio: `${timeline.project.width} / ${timeline.project.height}`,
                        objectFit: "contain"
                     }}
                     playsInline
                   />"""

new_canvas_tag = """<PreviewCanvas
                     project={timeline.project}
                     mediaItems={timeline.mediaItems}
                     currentTime={currentTime}
                     isPlaying={isPlaying}
                   />"""

content = content.replace(old_video_tag, new_canvas_tag)

# Remove the old video.pause() logic from togglePlay since PreviewCanvas handles it now,
# but wait, VideoEditorComponent still controls isPlaying state. That's fine.

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
