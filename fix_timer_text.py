with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_timer = """                   <div className="flex items-center font-mono gap-1">
                      <span className="text-white">{fmtTime(currentTime)}</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-gray-500">{fmtTime(currentMaxTime)}</span>
                   </div>"""

good_timer = """                   <div className="flex items-center font-mono gap-1">
                      <span id="editor-time-display" className="text-white">{fmtTime(currentTime)}</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-gray-500">{fmtTime(currentMaxTime)}</span>
                   </div>"""

content = content.replace(bad_timer, good_timer)

bad_effect = """  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);"""

good_effect = """  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);

  // Format time utility for the direct DOM update
  useEffect(() => {
    const handleTime = (e: any) => {
      const el = document.getElementById("editor-time-display");
      if (el) {
        const t = e.detail;
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        const ms = Math.floor((t % 1) * 10);
        el.innerText = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
      }
    };
    window.addEventListener('editor-time-update', handleTime);
    return () => window.removeEventListener('editor-time-update', handleTime);
  }, []);"""

content = content.replace(bad_effect, good_effect)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
