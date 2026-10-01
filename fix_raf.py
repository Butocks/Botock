with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_raf = """      setCurrentTime((prev) => {
        const next = prev + dt;
        const maxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 10;
        
        if (next >= maxTime && maxTime > 0) {
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });"""
      
good_raf = """      const maxTime = allVideoClips.length > 0 ? Math.max(...allVideoClips.map(c => c.timelineStart + c.duration)) : 10;
      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= maxTime && maxTime > 0) {
          // Use setTimeout to escape the React pure state updater function constraint
          setTimeout(() => setIsPlaying(false), 0);
          return maxTime;
        }
        return next;
      });"""

content = content.replace(bad_raf, good_raf)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
