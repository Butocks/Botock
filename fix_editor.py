with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_raf = """      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= maxTime && maxTime > 0) {
          // Use setTimeout to escape the React pure state updater function constraint
          setTimeout(() => setIsPlaying(false), 0);
          return maxTime;
        }
        return next;
      });"""

good_raf = """      // Bypass React state for 60fps playback to prevent crushing the render tree
      let next = timeRef.current + dt;
      if (next >= maxTime && maxTime > 0) {
          next = maxTime;
          setTimeout(() => setIsPlaying(false), 0);
      }
      timeRef.current = next;
      window.dispatchEvent(new CustomEvent('editor-time-update', { detail: next }));"""

content = content.replace(bad_raf, good_raf)

# We need to add timeRef
if "const timeRef = useRef" not in content:
    content = content.replace(
        "const rafRef = useRef<number | null>(null);",
        "const rafRef = useRef<number | null>(null);\n  const timeRef = useRef(currentTime);"
    )

    # Sync timeRef when currentTime changes manually (e.g. seeking)
    content = content.replace(
        "  const [isPlaying, setIsPlaying] = useState(false);",
        "  const [isPlaying, setIsPlaying] = useState(false);\n  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);"
    )

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
