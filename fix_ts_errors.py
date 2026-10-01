with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const mediaPool = useRef<Record<string, HTMLVideoElement | HTMLImageElement>>({});',
    'const mediaPool = useRef<Record<string, HTMLVideoElement | HTMLImageElement | HTMLAudioElement>>({});'
)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)


with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_timeline = """                  onEdgeCommit={timeline.commitLiveUpdate}
                  zoom={zoom}
                  thumbnailsBySource={thumbs}
                />"""

good_timeline = """                  onEdgeCommit={timeline.commitLiveUpdate}
                  zoom={zoom}
                  thumbnailsBySource={thumbs}
                  waveformsBySource={waveformsBySource}
                />"""

content = content.replace(bad_timeline, good_timeline)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
