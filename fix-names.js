const fs = require('fs');

let exp = fs.readFileSync('frontend/lib/editor/exportTimeline.ts', 'utf8');
exp = exp.replace(/t\.isHidden/g, 't.hidden');
exp = exp.replace(/t\.isMuted/g, 't.muted');
fs.writeFileSync('frontend/lib/editor/exportTimeline.ts', exp);

let prv = fs.readFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', 'utf8');
prv = prv.replace(/track\.isHidden/g, 'track.hidden');
prv = prv.replace(/track\.isMuted/g, 'track.muted');
fs.writeFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', prv);

let tm = fs.readFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', 'utf8');
tm = tm.replace(/track\.isMuted/g, 'track.muted');
fs.writeFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', tm);
