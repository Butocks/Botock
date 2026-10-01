with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

import re
matches = re.findall(r'useEffect\(\(\) => \{[^}]*isPlaying[^}]*allVideoClips[^}]*\}', content, re.DOTALL)
print("Found useEffect:", len(matches))
