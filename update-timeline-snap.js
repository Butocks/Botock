const fs = require('fs');
let code = fs.readFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', 'utf8');

const oldMove = `      if (dragState.edge === "move") {
         let newT = Math.max(0, original.timelineStart + timeChange);
         // simple snapping logic (snap to playhead and 0)
         if (Math.abs(newT - currentTime) < 0.2) newT = currentTime;
         else if (newT < 0.2) newT = 0;
         
         patch = { timelineStart: newT };
      }`;

const newMove = `      if (dragState.edge === "move") {
         let newT = Math.max(0, original.timelineStart + timeChange);
         const snapPoints = [0, currentTime];
         project.tracks.forEach(t => t.clips.forEach(c => {
            if (c.id !== original.id) {
               snapPoints.push(c.timelineStart, c.timelineStart + c.duration);
            }
         }));
         
         // Find closest snap point
         let closest = newT;
         let minDist = 0.2; // 0.2 seconds snap threshold
         
         // Snap start edge
         snapPoints.forEach(p => {
             if (Math.abs(newT - p) < minDist) {
                closest = p;
                minDist = Math.abs(newT - p);
             }
         });
         
         // Snap end edge
         const endT = newT + original.duration;
         snapPoints.forEach(p => {
             if (Math.abs(endT - p) < minDist) {
                closest = p - original.duration;
                minDist = Math.abs(endT - p);
             }
         });
         
         newT = closest;
         patch = { timelineStart: newT };
      }`;

code = code.replace(oldMove, newMove);
fs.writeFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', code);
