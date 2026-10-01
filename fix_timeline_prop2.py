with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_timeline = """                  thumbnailsBySource={thumbnailsBySource}
                />"""

good_timeline = """                  thumbnailsBySource={thumbnailsBySource}
                  waveformsBySource={waveformsBySource}
                />"""

content = content.replace(bad_timeline, good_timeline)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
