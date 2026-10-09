const fs = require('fs');

// Fix exportTimeline.ts
let ext = fs.readFileSync('frontend/lib/editor/exportTimeline.ts', 'utf8');
const oldExtEff = `  if (clip.effects && clip.effects.length > 0) {
    const eff = clip.effects[0].type;
    if (eff === "zoom-in") animScale = \`(1+0.5*\${prog})\`;
    else if (eff === "zoom-out") animScale = \`(1.5-0.5*\${prog})\`;
    else if (eff === "pan-left") animPanX = \`(\${targetW}*0.1*\${prog})\`;
    else if (eff === "pan-right") animPanX = \`(-\${targetW}*0.1*\${prog})\`;
    else if (eff === "fade-in") animOpacity = \`min(1,max(0,\${t_rel}/1.0))\`;
    else if (eff === "fade-out") {
        const out_start = Math.max(0, clip.duration - 1);
        const out_rel = \`(t-\${(clip.timelineStart + out_start).toFixed(3)})\`;
        animOpacity = \`max(0,min(1,1-\${out_rel}/1.0))\`;
    }
  }`;

const newExtEff = `  if (clip.effects && clip.effects.length > 0) {
    const effect = clip.effects[0];
    const eff = effect.type;
    const dur = effect.duration || 1.0;
    // Scale progress by dur (if dur is 2, effect finishes when t_rel reaches 2)
    const e_prog = \`min(1,max(0,\${t_rel}/\${dur.toFixed(3)}))\`;
    
    if (eff === "zoom-in") animScale = \`(1+0.5*\${e_prog})\`;
    else if (eff === "zoom-out") animScale = \`(1.5-0.5*\${e_prog})\`;
    else if (eff === "pan-left") animPanX = \`(\${targetW}*0.1*\${e_prog})\`;
    else if (eff === "pan-right") animPanX = \`(-\${targetW}*0.1*\${e_prog})\`;
    else if (eff === "fade-in") animOpacity = \`min(1,max(0,\${t_rel}/\${dur.toFixed(3)}))\`;
    else if (eff === "fade-out") {
        const out_start = Math.max(0, clip.duration - dur);
        const out_rel = \`(t-\${(clip.timelineStart + out_start).toFixed(3)})\`;
        animOpacity = \`max(0,min(1,1-\${out_rel}/\${dur.toFixed(3)}))\`;
    }
  }`;

ext = ext.replace(oldExtEff, newExtEff);
fs.writeFileSync('frontend/lib/editor/exportTimeline.ts', ext);


// Fix PreviewCanvas.tsx
let prv = fs.readFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', 'utf8');
const oldPrvEff = `            if (clip.effects && clip.effects.length > 0) {
               const eff = clip.effects[0].type;
               const progress = Math.min(1, Math.max(0, elapsed / clip.duration));
               if (eff === "zoom-in") animScale = 1 + (0.5 * progress);
               if (eff === "zoom-out") animScale = 1.5 - (0.5 * progress);
               if (eff === "pan-left") animPanX = (canvas.width * 0.1) * progress;
               if (eff === "pan-right") animPanX = -(canvas.width * 0.1) * progress;
               
               let effectOpacity = 1;
               if (eff === "fade-in") effectOpacity = Math.min(1, Math.max(0, elapsed / 1.0));
               if (eff === "fade-out") effectOpacity = Math.max(0, Math.min(1, 1 - (elapsed - (clip.duration - 1)) / 1.0));
               t.opacity = t.opacity * effectOpacity;
            }`;

const newPrvEff = `            if (clip.effects && clip.effects.length > 0) {
               const effect = clip.effects[0];
               const eff = effect.type;
               const dur = effect.duration || 1.0;
               const progress = Math.min(1, Math.max(0, elapsed / dur));
               
               if (eff === "zoom-in") animScale = 1 + (0.5 * progress);
               if (eff === "zoom-out") animScale = 1.5 - (0.5 * progress);
               if (eff === "pan-left") animPanX = (canvas.width * 0.1) * progress;
               if (eff === "pan-right") animPanX = -(canvas.width * 0.1) * progress;
               
               let effectOpacity = 1;
               if (eff === "fade-in") effectOpacity = Math.min(1, Math.max(0, elapsed / dur));
               if (eff === "fade-out") {
                  const out_start = Math.max(0, clip.duration - dur);
                  effectOpacity = Math.max(0, Math.min(1, 1 - (elapsed - out_start) / dur));
               }
               t.opacity = t.opacity * effectOpacity;
            }`;

prv = prv.replace(oldPrvEff, newPrvEff);
fs.writeFileSync('frontend/app/tools/video-editor/components/PreviewCanvas.tsx', prv);

