with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_block = """          if (el instanceof HTMLVideoElement) {
             // Sync video time if drifted by more than 0.1s
             if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                el.currentTime = sourceTime;
             }
             if (isPlaying && el.paused) {
                el.play().catch(()=>{}).then(()=>{ el.currentTime = sourceTime; });
             } else if (!isPlaying && !el.paused) {
                el.pause();
             }
          }"""

good_block = """          if (el instanceof HTMLVideoElement) {
             if (el.readyState >= 1) { // Only seek if metadata is loaded
               // Sync video time if drifted by more than 0.1s
               if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                  try { el.currentTime = sourceTime; } catch(e) {}
               }
             }
             if (isPlaying && el.paused) {
                el.play().catch(()=>{});
             } else if (!isPlaying && !el.paused) {
                el.pause();
             }
          }"""

content = content.replace(bad_block, good_block)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
