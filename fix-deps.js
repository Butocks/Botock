const fs = require('fs');
let code = fs.readFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', 'utf8');

code = code.replace(/\}, \[dragging, project, mediaItems, totalDuration, onEdgeLive, onEdgeCommit\]\);/, '}, [dragging, project, mediaItems, totalDuration, onEdgeLive, onEdgeCommit, currentTime]);');
fs.writeFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', code);
