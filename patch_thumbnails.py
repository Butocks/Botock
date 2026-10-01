with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "r") as f:
    content = f.read()

# Pass mediaItems to TrackLane usage
content = content.replace(
    'thumbnailsBySource={thumbnailsBySource}',
    'thumbnailsBySource={thumbnailsBySource}\n            mediaItems={mediaItems}'
)

# Add mediaItems to TrackLane props
content = content.replace(
    'const TrackLane = React.memo(function TrackLane({ track, totalDuration, selectedClipId, onSelectClip, startDrag, sourceIndexOf, thumbnailsBySource }: any) {',
    'const TrackLane = React.memo(function TrackLane({ track, totalDuration, selectedClipId, onSelectClip, startDrag, sourceIndexOf, thumbnailsBySource, mediaItems }: any) {'
)

# Update thumbnail rendering logic
old_thumb_logic = """                {/* Thumbnails */}
                {clip.type === "video" && thumbs.length > 0 && (
                  <div className="absolute inset-0 flex opacity-50 pointer-events-none overflow-hidden">
                    {thumbs.map((src: string, i: number) => (
                      <img key={i} src={src} className="h-full object-cover shrink-0" style={{ width: "50px" }} draggable={false} />
                    ))}
                  </div>
                )}"""

new_thumb_logic = """                {/* Thumbnails */}
                {clip.type === "video" && thumbs.length > 0 && (
                  <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden bg-black/20">
                    {(() => {
                      const media = mediaItems.find((m: any) => m.id === clip.sourceId);
                      const originalDuration = media ? media.duration : clip.duration;
                      const innerWidthPct = clip.duration > 0 ? (originalDuration / clip.duration) * 100 : 100;
                      const innerLeftPct = clip.duration > 0 ? -(clip.sourceStart / clip.duration) * 100 : 0;
                      return (
                        <div
                          className="absolute top-0 bottom-0 flex"
                          style={{ width: `${innerWidthPct}%`, left: `${innerLeftPct}%` }}
                        >
                          {thumbs.map((src: string, i: number) => (
                            <img key={i} src={src} className="h-full object-cover shrink-0 flex-1" draggable={false} />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}"""

content = content.replace(old_thumb_logic, new_thumb_logic)

with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "w") as f:
    f.write(content)
