with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_styles = """                v.style.position = "absolute";
                v.style.width = "10px";
                v.style.height = "10px";
                v.style.opacity = "0.01";
                v.style.pointerEvents = "none";
                v.style.zIndex = "-10";"""

good_styles = """                // Make video fully sized and opaque so Chrome does NOT suspend it.
                // It will be hidden behind the z-10 Canvas.
                v.style.position = "absolute";
                v.style.top = "0";
                v.style.left = "0";
                v.style.width = "100%";
                v.style.height = "100%";
                v.style.opacity = "1";
                v.style.pointerEvents = "none";"""

content = content.replace(bad_styles, good_styles)

# Let's also add a failsafe: if el.currentTime is STILL not moving (e.g. playing is true but it's stuck),
# we fall back to scrubbing it manually every frame so it doesn't just freeze for 1.0s.
# We can detect if it's stuck by checking if elapsed time is moving but el.currentTime isn't.

bad_sync = """               if (playing) {
                  // NATIVE PLAYBACK: Let the browser handle the frames. 
                  // No forced seeking unless severely drifted (> 1.0s) to prevent stutter.
                  if (Math.abs(el.currentTime - sourceTime) > 1.0) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
                  if (el.paused) el.play().catch(()=>{});
               }"""

good_sync = """               if (playing) {
                  // If video is not advancing naturally (e.g. browser suspended it), force it.
                  // We check if it's drifting by > 0.1s. If it is, we force it. 
                  // Wait, if we force it > 0.1s, we get micro-stuttering.
                  // Let's use 0.15s. If it's truly suspended, it will stutter but at least play.
                  if (Math.abs(el.currentTime - sourceTime) > 0.15) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
                  if (el.paused) el.play().catch(()=>{});
               }"""

content = content.replace(bad_sync, good_sync)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
