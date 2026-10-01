with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_timeline = """                  zoom={zoom}
                  thumbnailsBySource={thumbs}
                />"""

good_timeline = """                  zoom={zoom}
                  thumbnailsBySource={thumbs}
                  waveformsBySource={waveformsBySource}
                />"""

content = content.replace(bad_timeline, good_timeline)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
