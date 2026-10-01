with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

# Fix 1: Use sortedTracks
content = content.replace(
    '      const sortedTracks = [...project.tracks].reverse();\n      \n      project.tracks.forEach(track => {',
    '      const sortedTracks = [...project.tracks].reverse();\n      \n      sortedTracks.forEach(track => {'
)

# Fix 2: Fix aggressive seeking causing buffering and black frames
bad_sync = """               // Sync time only if out of sync
               if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                  try { el.currentTime = sourceTime; } catch(e) {}
               }"""

good_sync = """               // Sync time only if significantly out of sync to prevent flickering (seek causes buffering)
               const maxDrift = playing ? 0.25 : 0.05;
               if (Math.abs(el.currentTime - sourceTime) > maxDrift) {
                  try { el.currentTime = sourceTime; } catch(e) {}
               }
               el.playbackRate = clip.speed || 1;"""

content = content.replace(bad_sync, good_sync)

# Fix 3: Don't skip drawing if readyState is 1 (HAVE_METADATA), try to draw it anyway,
# it will draw the last frame the browser has. readyState < 2 is too strict for scrubbing.
# Actually, HTMLVideoElement can be drawn if readyState >= 1 in most modern browsers,
# or if it fails, try/catch around drawImage will prevent crash.

bad_draw_check = """            if (el instanceof HTMLVideoElement && el.readyState < 2) return;
            if (el instanceof HTMLImageElement && !el.complete) return;"""

good_draw_check = """            if (el instanceof HTMLVideoElement && el.readyState === 0) return;
            if (el instanceof HTMLImageElement && !el.complete) return;"""

content = content.replace(bad_draw_check, good_draw_check)

bad_draw_call = """                ctx.drawImage(el, -finalW / 2, -finalH / 2, finalW, finalH);"""
good_draw_call = """                try {
                   ctx.drawImage(el, -finalW / 2, -finalH / 2, finalW, finalH);
                } catch(e) {
                   // Ignore drawImage errors during seek/buffering
                }"""

content = content.replace(bad_draw_call, good_draw_call)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
