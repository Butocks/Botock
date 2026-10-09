const fs = require('fs');

let code = fs.readFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', 'utf8');

// The render loop iterates tracks
// `project.tracks.forEach(track => {`
// Let's add: `if (track.isHidden) return;`
code = code.replace(/project\.tracks\.forEach\(track => \{/g, 'project.tracks.forEach(track => {\n        if (track.isHidden) return;\n        const trackMuted = track.isMuted;');

// Then update `el.muted = isMuted;`
// We need to use trackMuted
code = code.replace(/const isMuted = clip\.audio\?\.muted \|\| false;/g, 'const isMuted = trackMuted || (clip.audio?.muted || false);');

fs.writeFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', code);
