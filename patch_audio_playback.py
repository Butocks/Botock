with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

# 1. Add audio to requiredClips
content = content.replace(
    'if (c.type === "video" || c.type === "image") requiredClips.add(c.id);',
    'if (c.type === "video" || c.type === "image" || c.type === "audio") requiredClips.add(c.id);'
)

# 2. Cleanup unused elements includes HTMLAudioElement
content = content.replace(
    'if (el instanceof HTMLVideoElement) {',
    'if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {'
)

# 3. Create audio elements in the pool
old_create = """       if ((c.type === "video" || c.type === "image") && !mediaPool.current[c.id]) {
          const mediaItem = mediaItems.find(m => m.id === c.sourceId);
          if (mediaItem) {
             if (c.type === "video") {"""

new_create = """       if ((c.type === "video" || c.type === "image" || c.type === "audio") && !mediaPool.current[c.id]) {
          const mediaItem = mediaItems.find(m => m.id === c.sourceId);
          if (mediaItem) {
             if (c.type === "audio") {
                const a = document.createElement("audio");
                a.src = mediaItem.url;
                a.crossOrigin = "anonymous";
                a.preload = "auto";
                mediaPool.current[c.id] = a;
                if (poolRef.current) poolRef.current.appendChild(a);
                a.load();
             } else if (c.type === "video") {"""

content = content.replace(old_create, new_create)

# 4. Remove the early return for audio tracks in the render loop!
# Wait, audio tracks shouldn't be drawn to the canvas, but they MUST be processed for playback.
old_track_loop = """      sortedTracks.forEach(track => {
        if (track.hidden || track.type === "audio") return;

        track.clips.forEach(clip => {"""

new_track_loop = """      sortedTracks.forEach(track => {
        if (track.hidden) return;

        track.clips.forEach(clip => {"""

content = content.replace(old_track_loop, new_track_loop)

# 5. Playback logic for audio elements
old_play_logic = """            if (el instanceof HTMLVideoElement) {
               el.playbackRate = clip.speed || 1;
               
               if (playing) {
                  // If video is not advancing naturally (e.g. browser suspended it), force it.
                  // We check if it's drifting by > 0.1s. If it is, we force it. 
                  // Wait, if we force it > 0.1s, we get micro-stuttering.
                  // Let's use 0.15s. If it's truly suspended, it will stutter but at least play.
                  if (Math.abs(el.currentTime - sourceTime) > 0.15) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
                  if (el.paused) el.play().catch(()=>{});
               } else {
                  // SCRUBBING/PAUSED: Exact frame accuracy required.
                  if (!el.paused) el.pause();
                  if (Math.abs(el.currentTime - sourceTime) > 0.05) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
               }
            }

            // Draw to Canvas"""

new_play_logic = """            if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
               el.playbackRate = clip.speed || 1;
               
               // Apply volume and mute from clip settings
               const isMuted = clip.audio?.muted ?? false;
               const volumePercent = clip.audio?.volumePercent ?? 100;
               el.muted = isMuted || (el instanceof HTMLVideoElement && clip.type === "video"); // Video is muted if it's just visual, or explicitly. Wait, we want video audio? The user requested audio tracks. If a video has audio, we should respect it! But for now, videos are muted by default to avoid overlap, unless we handle their volume too. Let's respect clip.audio!
               el.muted = isMuted || (clip.type === "video" && (clip.audio?.muted === undefined ? true : clip.audio.muted));
               el.volume = el.muted ? 0 : Math.min(1, volumePercent / 100);
               
               if (playing) {
                  if (Math.abs(el.currentTime - sourceTime) > 0.15) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
                  if (el.paused) el.play().catch(()=>{});
               } else {
                  if (!el.paused) el.pause();
                  if (Math.abs(el.currentTime - sourceTime) > 0.05) {
                      try { el.currentTime = sourceTime; } catch(e) {}
                  }
               }
            }

            // Only Draw to Canvas if it's visual
            if (clip.type === "audio") return;
            
            ctx.save();"""

content = content.replace(old_play_logic, new_play_logic)

# 6. Out of bounds pause logic for audio
old_out = """          } else {
            // Clip is not active (out of bounds)
            if (el instanceof HTMLVideoElement && !el.paused) {
               el.pause();
            }
          }"""

new_out = """          } else {
            // Clip is not active (out of bounds)
            if ((el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) && !el.paused) {
               el.pause();
            }
          }"""

content = content.replace(old_out, new_out)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
