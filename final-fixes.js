const fs = require('fs');

// Fix VideoEditorComponent.tsx (remove activeTab)
let code = fs.readFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', 'utf8');
code = code.replace(/activeTab=\{activeTab\}/g, '');
// there might be a \`activeTab !== "Edit"\` etc around line 395
code = code.replace(/activeTab !== "Edit"/g, 'false'); // just safely remove it if there's any stray
code = code.replace(/activeTab/g, '""');
fs.writeFileSync('frontend/app/tools/video-editor/VideoEditorComponent.tsx', code);

// Fix TransformInspector.tsx
let insp = fs.readFileSync('frontend/app/tools/video-editor/components/TransformInspector.tsx', 'utf8');

// Audio fixes
const defaultAudio = "{ volumePercent: 100, muted: false, fadeInSeconds: 0, fadeOutSeconds: 0 }";
insp = insp.replace(/\{ \.\.\.clip\.audio, volumePercent:/g, `{ ...(clip.audio || ${defaultAudio}), volumePercent:`);
insp = insp.replace(/\{ \.\.\.clip\.audio, muted:/g, `{ ...(clip.audio || ${defaultAudio}), muted:`);
insp = insp.replace(/\{ \.\.\.clip\.audio, fadeInSeconds:/g, `{ ...(clip.audio || ${defaultAudio}), fadeInSeconds:`);
insp = insp.replace(/\{ \.\.\.clip\.audio, fadeOutSeconds:/g, `{ ...(clip.audio || ${defaultAudio}), fadeOutSeconds:`);

// Effects ID fix
const defaultEff = '{ id: "eff-" + Date.now(), type: "none", intensity: 1, duration: 1 }';
insp = insp.replace(/\{ type: "none", intensity: 1, duration: 1 \}/g, defaultEff);

// ChromaKey spillReduction fix
const defaultChroma = '{ color: "#00ff00", similarity: 0.3, blend: 0.1, spillReduction: 0 }';
insp = insp.replace(/\{ color: "#00ff00", similarity: 0\.3, blend: 0\.1 \}/g, defaultChroma);

fs.writeFileSync('frontend/app/tools/video-editor/components/TransformInspector.tsx', insp);
