import re

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

# Fix drawImage and intrinsic dimensions for Audio
bad_dimensions = """            const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : el.width;
            const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : el.height;"""

good_dimensions = """            const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : (el instanceof HTMLImageElement ? el.width : 0);
            const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : (el instanceof HTMLImageElement ? el.height : 0);"""

content = content.replace(bad_dimensions, good_dimensions)

bad_draw = """                   ctx.drawImage(el, -finalW / 2, -finalH / 2, finalW, finalH);"""

good_draw = """                   if (!(el instanceof HTMLAudioElement)) {
                       ctx.drawImage(el as any, -finalW / 2, -finalH / 2, finalW, finalH);
                   }"""

content = content.replace(bad_draw, good_draw)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)


# Fix waveformsBySource property missing in VideoEditorComponent
with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# Find the EditorTimeline invocation and replace it properly using regex
timeline_pattern = r'(<EditorTimeline[^>]*?thumbnailsBySource=\{thumbs\})\s*(/>)'
content = re.sub(timeline_pattern, r'\1\n                  waveformsBySource={waveformsBySource}\n                \2', content)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
