with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_play = """               // Play state
               if (playing && el.paused && el.readyState >= 2) {
                  el.play().catch(()=>{});
               } else if (!playing && !el.paused) {
                  el.pause();
               }"""

good_play = """               // Play state
               if (playing && el.paused) {
                  el.play().catch(()=>{});
               } else if (!playing && !el.paused) {
                  el.pause();
               }"""

content = content.replace(bad_play, good_play)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
