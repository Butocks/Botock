import re

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

# We will replace the entire Render Loop useEffect with a proper rAF-based loop

old_loop_pattern = r"  // 2\. Render Loop.*?\}\, \[currentTime, project, isPlaying\]\);"

new_loop = """  // 2. Render Loop (Independent 60fps rAF)
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  
  // Sync refs so rAF loop always has latest state without triggering re-binds
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    let raf: number;
    let isActive = true;

    const render = () => {
      if (!isActive) return;
      
      const canvas = canvasRef.current;
      if (!canvas) {
         raf = requestAnimationFrame(render);
         return;
      }
      
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (!ctx) {
         raf = requestAnimationFrame(render);
         return;
      }

      const currT = currentTimeRef.current;
      const playing = isPlayingRef.current;

      // Clear background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sortedTracks = [...project.tracks].reverse();
      
      project.tracks.forEach(track => {
        if (track.hidden || track.type === "audio") return;

        track.clips.forEach(clip => {
          if (currT >= clip.timelineStart && currT < clip.timelineStart + clip.duration) {
            const el = mediaPool.current[clip.id];
            if (!el) return;

            const elapsed = currT - clip.timelineStart;
            const sourceTime = clip.sourceStart + (elapsed * clip.speed);

            if (el instanceof HTMLVideoElement) {
               // Sync time only if out of sync
               if (Math.abs(el.currentTime - sourceTime) > 0.1) {
                  try { el.currentTime = sourceTime; } catch(e) {}
               }
               // Play state
               if (playing && el.paused && el.readyState >= 2) {
                  el.play().catch(()=>{});
               } else if (!playing && !el.paused) {
                  el.pause();
               }
            }

            if (el instanceof HTMLVideoElement && el.readyState < 2) return;
            if (el instanceof HTMLImageElement && !el.complete) return;

            ctx.save();
            const t = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
            const pxX = (t.x / 100) * canvas.width;
            const pxY = (t.y / 100) * canvas.height;
            
            const intrinsicW = el instanceof HTMLVideoElement ? el.videoWidth : el.width;
            const intrinsicH = el instanceof HTMLVideoElement ? el.videoHeight : el.height;
            
            if (intrinsicW > 0 && intrinsicH > 0) {
                const scaleFit = Math.min(canvas.width / intrinsicW, canvas.height / intrinsicH);
                const baseW = intrinsicW * scaleFit;
                const baseH = intrinsicH * scaleFit;
                
                const finalW = baseW * (t.width / 100) * t.scaleX;
                const finalH = baseH * (t.height / 100) * t.scaleY;

                ctx.translate(pxX, pxY);
                ctx.rotate((t.rotation * Math.PI) / 180);
                ctx.globalAlpha = t.opacity / 100;
                
                ctx.drawImage(el, -finalW / 2, -finalH / 2, finalW, finalH);
            }
            ctx.restore();
          } else {
            const el = mediaPool.current[clip.id];
            if (el instanceof HTMLVideoElement && !el.paused) {
               el.pause();
            }
          }
        });
      });

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      isActive = false;
      cancelAnimationFrame(raf);
    };
  }, [project]);"""

content = re.sub(old_loop_pattern, new_loop, content, flags=re.DOTALL)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
