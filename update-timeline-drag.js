const fs = require('fs');

let code = fs.readFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', 'utf8');

// 1. Add "move" to drag edge type
// `type DragEdge = "start" | "end" | null;`
code = code.replace(/type DragEdge = "start" \| "end" \| null;/, 'type DragEdge = "start" | "end" | "move" | null;');

// 2. Add pointer down on the clip body to start a "move" drag
const oldClipBody = `              <div
                key={clip.id}
                onPointerDown={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
                className={\`absolute top-2 bottom-2 rounded-lg border-2 overflow-hidden transition-all \${
                  selected ? "border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.5)] z-10" : colorClass + "/50 border-transparent hover:border-white/20"
                }\`}
                style={{ left: \`\${leftPct}%\`, width: \`\${widthPct}%\`, minWidth: "2px" }}`;
                
const newClipBody = `              <div
                key={clip.id}
                onPointerDown={(e) => { e.stopPropagation(); onSelectClip(clip.id); startDrag(e, clip.id, "move"); }}
                className={\`absolute top-2 bottom-2 rounded-lg border-2 overflow-hidden transition-all \${
                  selected ? "border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.5)] z-10 cursor-grab active:cursor-grabbing" : colorClass + "/50 border-transparent hover:border-white/20 cursor-pointer"
                }\`}
                style={{ left: \`\${leftPct}%\`, width: \`\${widthPct}%\`, minWidth: "2px" }}`;

code = code.replace(oldClipBody, newClipBody);

// 3. Update pointerMove to handle "move"
// Let's find the pointerMove logic and inject our snap logic and "move" logic
const moveLogic = `
      let pxChange = dx;
      let timeChange = pxChange / pxPerSec;
      
      let patch: any = {};
      if (dragState.edge === "move") {
         let newT = Math.max(0, original.timelineStart + timeChange);
         // simple snapping logic (snap to playhead and 0)
         if (Math.abs(newT - currentTime) < 0.2) newT = currentTime;
         else if (newT < 0.2) newT = 0;
         
         patch = { timelineStart: newT };
      } else if (dragState.edge === "start") {
         let newT = original.timelineStart + timeChange;
         let newSS = original.sourceStart + (timeChange * original.speed);
         if (newT < 0) { newT = 0; newSS = original.sourceStart - (original.timelineStart * original.speed); }
         if (newT >= original.timelineStart + original.duration - 0.1) return;
         patch = { timelineStart: newT, sourceStart: newSS, duration: original.duration - (newT - original.timelineStart) };
      } else if (dragState.edge === "end") {
         let newDur = original.duration + timeChange;
         if (newDur < 0.1) return;
         // optional: constrain by max source
         patch = { duration: newDur, sourceEnd: original.sourceStart + (newDur * original.speed) };
      }
      onEdgeLive(patch);`;

code = code.replace(/      if \(dragState\.edge === "start"\) \{[\s\S]*?\} else if \(dragState\.edge === "end"\) \{[\s\S]*?\}\n      onEdgeLive\(patch\);/, moveLogic);


fs.writeFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', code);
