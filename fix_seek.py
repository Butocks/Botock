with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_block = """             if (el.readyState >= 1) { // Only seek if metadata is loaded
               // Sync video time if drifted by more than 0.1s
               if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                  try { el.currentTime = sourceTime; } catch(e) {}
               }
             }"""
             
good_block = """             // Sync video time if drifted by more than 0.1s
             if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                try { el.currentTime = sourceTime; } catch(e) {}
             }"""

content = content.replace(bad_block, good_block)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
