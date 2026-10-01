with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_toggle = """  const togglePlay = () => {
    const video = videoRef.current;
    const maxTime = allVideoClips.length > 0 ? allVideoClips[allVideoClips.length - 1].timelineStart + allVideoClips[allVideoClips.length - 1].duration : 10;"""

good_toggle = """  const togglePlay = () => {
    const video = videoRef.current;
    const maxTime = allVideoClips.length > 0 ? Math.max(...allVideoClips.map(c => c.timelineStart + c.duration)) : 10;"""

content = content.replace(bad_toggle, good_toggle)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
