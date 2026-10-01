with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

bad_effect = """  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);"""

good_effect = """  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  
  useEffect(() => {
    const handleTime = (e: any) => { currentTimeRef.current = e.detail; };
    window.addEventListener('editor-time-update', handleTime);
    return () => window.removeEventListener('editor-time-update', handleTime);
  }, []);"""

content = content.replace(bad_effect, good_effect)

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
