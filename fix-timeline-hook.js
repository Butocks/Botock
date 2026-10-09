const fs = require('fs');
let code = fs.readFileSync('frontend/lib/editor/useEditorTimeline.ts', 'utf8');

const updateTrackStr = `    const handleUpdateTrack = (e: any) => {
      pushHistory();
      setProject(prev => {
         const next = { ...prev, tracks: prev.tracks.map(t => t.id === e.detail.id ? { ...t, ...e.detail } : t) };
         return next;
      });
    };`;

code = code.replace(/    const handleDeleteTrack = \(e: any\) => \{/, updateTrackStr + '\n    const handleDeleteTrack = (e: any) => {');
code = code.replace(/    window\.addEventListener\('editor-delete-track', handleDeleteTrack\);/, "    window.addEventListener('editor-delete-track', handleDeleteTrack);\n    window.addEventListener('editor-update-track', handleUpdateTrack);");
code = code.replace(/       window\.removeEventListener\('editor-delete-track', handleDeleteTrack\);/, "       window.removeEventListener('editor-delete-track', handleDeleteTrack);\n       window.removeEventListener('editor-update-track', handleUpdateTrack);");

// I also need to make sure t.isHidden maps to track.hidden or vice versa. In exportTimeline I used t.isHidden ?? false. But in EditorTimeline I saw track.hidden.
// Let's normalize it to isHidden. 
// Wait, EditorTimeline used track.hidden! Let me check what I just wrote in fix-timeline-toggles.js. I used !track.hidden.
// The types.ts probably has isHidden.
