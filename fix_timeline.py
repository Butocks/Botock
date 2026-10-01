with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "r") as f:
    content = f.read()

bad_playhead = """              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-auto cursor-ew-resize group"
              style={{ left: `${(currentTime / totalDuration) * 100}%`, transform: 'translateX(-50%)', width: '20px' }}
              onPointerDown={(e) => { e.stopPropagation(); setDraggingPlayhead(true); }}"""

good_playhead = """              id="editor-playhead"
              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-auto cursor-ew-resize group"
              style={{ left: `${(currentTime / totalDuration) * 100}%`, transform: 'translateX(-50%)', width: '20px' }}
              onPointerDown={(e) => { e.stopPropagation(); setDraggingPlayhead(true); }}"""

content = content.replace(bad_playhead, good_playhead)

# Add event listener
bad_effect = """  useEffect(() => {
    if (!dragging) return;"""

good_effect = """  useEffect(() => {
    const handleTimeUpdate = (e: any) => {
      const t = e.detail;
      const el = document.getElementById("editor-playhead");
      if (el && totalDuration > 0) {
        el.style.left = `${(t / totalDuration) * 100}%`;
      }
    };
    window.addEventListener('editor-time-update', handleTimeUpdate);
    return () => window.removeEventListener('editor-time-update', handleTimeUpdate);
  }, [totalDuration]);

  useEffect(() => {
    if (!dragging) return;"""

content = content.replace(bad_effect, good_effect)

with open("frontend/app/tools/video-editor/components/EditorTimeline.tsx", "w") as f:
    f.write(content)
