with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_listener = """  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);"""

good_listener = """  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => {
    const handleTimeUpdate = (e: any) => { currentTimeRef.current = e.detail; };
    window.addEventListener('editor-time-update', handleTimeUpdate);
    return () => window.removeEventListener('editor-time-update', handleTimeUpdate);
  }, []);"""

content = content.replace(bad_listener, good_listener)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
