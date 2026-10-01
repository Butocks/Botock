with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'import { useThumbnails } from "@/lib/editor/useThumbnails";',
    'import { useThumbnails } from "@/lib/editor/useThumbnails";\nimport { useWaveforms } from "@/lib/editor/useWaveforms";'
)

# Use hook
content = content.replace(
    'const thumbs = useThumbnails();',
    'const thumbs = useThumbnails();\n  const waveformsBySource = useWaveforms(mediaBin.items);'
)

# Pass to EditorTimeline
content = content.replace(
    '                  thumbnailsBySource={thumbs}',
    '                  thumbnailsBySource={thumbs}\n                  waveformsBySource={waveformsBySource}'
)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
