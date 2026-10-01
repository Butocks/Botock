with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "r") as f:
    content = f.read()

# 1. Add waveformsBySource to EditorTimeline props
content = content.replace(
    '  thumbnailsBySource: Record<string, string[]>;',
    '  thumbnailsBySource: Record<string, string[]>;\n  waveformsBySource: Record<string, number[]>;'
)
content = content.replace(
    '  thumbnailsBySource\n}: Props) {',
    '  thumbnailsBySource,\n  waveformsBySource\n}: Props) {'
)

# 2. Add waveformsBySource to TrackLane
content = content.replace(
    'const TrackLane = React.memo(function TrackLane({ track, totalDuration, selectedClipId, onSelectClip, startDrag, sourceIndexOf, thumbnailsBySource, mediaItems }: any) {',
    'const TrackLane = React.memo(function TrackLane({ track, totalDuration, selectedClipId, onSelectClip, startDrag, sourceIndexOf, thumbnailsBySource, waveformsBySource, mediaItems }: any) {'
)

content = content.replace(
    '            thumbnailsBySource={thumbnailsBySource}',
    '            thumbnailsBySource={thumbnailsBySource}\n            waveformsBySource={waveformsBySource}'
)

# 3. Render waveforms inside TrackLane clip
old_thumb = """                {/* Thumbnails */}
                {clip.type === "video" && thumbs.length > 0 && ("""

new_thumb = """                {/* Waveforms (Background) */}
                {(() => {
                  const peaks = waveformsBySource[clip.sourceId];
                  if (!peaks || peaks.length === 0) return null;

                  const media = mediaItems.find((m: any) => m.id === clip.sourceId);
                  const originalDuration = media ? media.duration : clip.duration;
                  const innerWidthPct = clip.duration > 0 ? (originalDuration / clip.duration) * 100 : 100;
                  const innerLeftPct = clip.duration > 0 ? -(clip.sourceStart / clip.duration) * 100 : 0;

                  return (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                       <div className="absolute top-1/2 bottom-0 flex items-end w-full" style={{ width: `${innerWidthPct}%`, left: `${innerLeftPct}%` }}>
                          <svg preserveAspectRatio="none" viewBox={`0 0 ${peaks.length} 100`} className="w-full h-full fill-white">
                             {peaks.map((p: number, i: number) => (
                                <rect key={i} x={i} y={100 - (p * 100)} width="1" height={Math.max(1, p * 100)} />
                             ))}
                          </svg>
                       </div>
                    </div>
                  );
                })()}

                {/* Thumbnails */}
                {clip.type === "video" && thumbs.length > 0 && ("""

content = content.replace(old_thumb, new_thumb)

with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "w") as f:
    f.write(content)
