const fs = require('fs');

let code = fs.readFileSync('frontend/lib/editor/exportTimeline.ts', 'utf8');

// Replace buildClipVideoFilter
const newBuildClipVideoFilter = `function buildClipVideoFilter(
  clip: TimelineClip,
  inputIndex: number,
  label: string,
  targetW: number,
  targetH: number
): { filterStr: string, overlayX: string, overlayY: string } {
  const speedFactor = (1 / Math.min(4, Math.max(0.25, clip.speed))).toFixed(4);
  let trim = \`trim=start=\${clip.sourceStart.toFixed(3)}:end=\${clip.sourceEnd.toFixed(3)},setpts=(\${speedFactor}*(PTS-STARTPTS))+\${clip.timelineStart.toFixed(3)}/TB\`;
  
  if (clip.type === "image") {
     trim = \`loop=loop=-1:size=1,\${trim}\`;
  }
  
  const filterParts = [\`[\${inputIndex}:v]\${trim}\`];

  // Convert to RGBA early for transparent processing
  filterParts.push(\`format=rgba\`);

  if (clip.chromaKey && clip.chromaKey.enabled) {
    const c = clip.chromaKey;
    filterParts.push(\`colorkey=\${c.color}:\${c.similarity}:\${c.blend}\`);
  }

  if (clip.crop) {
    filterParts.push(buildCropFilter(clip.crop));
  }

  if (clip.filters) {
    filterParts.push(buildColorFilter(clip.filters.brightness, clip.filters.contrast, clip.filters.saturation));
  }

  const t_rel = \`(t-\${clip.timelineStart.toFixed(3)})\`;
  const prog = \`min(1,max(0,\${t_rel}/\${clip.duration.toFixed(3)}))\`;

  let animScale = \`1\`;
  let animPanX = \`0\`;
  let animOpacity = \`1\`;

  if (clip.effects && clip.effects.length > 0) {
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
  }

  const tForm = clip.transform || { x: 50, y: 50, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1, opacity: 100 };
  
  filterParts.push(\`scale=\${targetW}:\${targetH}:force_original_aspect_ratio=decrease\`);

  const finalScaleX = (tForm.width / 100) * tForm.scaleX;
  const finalScaleY = (tForm.height / 100) * tForm.scaleY;
  
  if (finalScaleX !== 1 || finalScaleY !== 1 || animScale !== \`1\`) {
     filterParts.push(\`scale=w='iw*\${finalScaleX.toFixed(4)}*\${animScale}':h='ih*\${finalScaleY.toFixed(4)}*\${animScale}':eval=frame\`);
  }

  if (tForm.rotation !== 0) {
     filterParts.push(\`rotate=a=\${tForm.rotation}*PI/180:c=none:ow='hypot(iw,ih)':oh='hypot(iw,ih)'\`);
  }

  const baseOpacity = tForm.opacity / 100;
  if (baseOpacity < 1 || animOpacity !== \`1\`) {
     filterParts.push(\`colorchannelmixer=aa='\${baseOpacity}*\${animOpacity}'\`);
  }

  filterParts.push(\`setsar=1\`);
  
  const filterStr = \`\${filterParts.join(",")}[\${label}]\`;

  const overlayX = \`(\${targetW}*\${(tForm.x / 100).toFixed(4)} - w/2 + \${animPanX})\`;
  const overlayY = \`(\${targetH}*\${(tForm.y / 100).toFixed(4)} - h/2)\`;

  return { filterStr, overlayX, overlayY };
}`;

code = code.replace(/function buildClipVideoFilter\([\s\S]*?return \`\$\{filterParts\.join\(\",\"\)\}\[\$\{label\}\]\`;\n\}/, newBuildClipVideoFilter);


// Now replace track and clip handling in exportEditorProject
// We need to add `trackMuted: boolean` flag or similar to clips.
// Let's create `type ExportClip = TimelineClip & { trackMuted: boolean, trackHidden: boolean }`

const newExportLogic1 = `  const allVideoClips: (TimelineClip & { trackMuted: boolean, trackHidden: boolean })[] = [];
  const allAudioClips: (TimelineClip & { trackMuted: boolean, trackHidden: boolean })[] = [];
  
  project.tracks.forEach(t => {
      const isHidden = t.isHidden ?? false;
      const isMuted = t.isMuted ?? false;
      t.clips.forEach(c => {
         const exportClip = { ...c, trackMuted: isMuted, trackHidden: isHidden };
         if (c.type === "video" || c.type === "image") allVideoClips.push(exportClip);
         if (c.type === "audio") allAudioClips.push(exportClip);
      });
  });
  
  // Filter out hidden video clips
  const visibleVideoClips = allVideoClips.filter(c => !c.trackHidden);
  visibleVideoClips.sort((a, b) => a.timelineStart - b.timelineStart);
  
  const allAudioSources = [...allVideoClips, ...allAudioClips].filter(c => !c.trackMuted);
  allAudioSources.sort((a, b) => a.timelineStart - b.timelineStart);

  const textClips: (TimelineClip & { trackHidden: boolean })[] = [];
  project.tracks.forEach(t => {
      t.clips.forEach(c => {
         if (c.type === "text") textClips.push({ ...c, trackHidden: t.isHidden ?? false });
      });
  });
  const visibleTextClips = textClips.filter(c => !c.trackHidden);

  if (visibleVideoClips.length === 0 && allAudioSources.length === 0 && visibleTextClips.length === 0) throw new Error("No media clips to export.");`;

code = code.replace(/  const allVideoClips: TimelineClip\[\] = \[\];[\s\S]*?if \(allVideoClips\.length === 0 && allAudioClips\.length === 0\) throw new Error\("No media clips to export\."\);/, newExportLogic1);


// Update textClips map to visibleTextClips
code = code.replace(/if \(textClips\.length > 0\)/, 'if (visibleTextClips.length > 0)');
code = code.replace(/textClips\.forEach\(\(tClip, index\) => \{/, 'visibleTextClips.forEach((tClip, index) => {');

// Update usedSourceIds mapping
code = code.replace(/const usedSourceIds = Array\.from\(new Set\(\[\.\.\.allVideoClips, \.\.\.allAudioClips\]\.map\(c => c\.sourceId\)\)\);/, `const usedSourceIds = Array.from(new Set([...visibleVideoClips, ...allAudioSources].map(c => c.sourceId)));`);

// Update file naming
const newFileNaming = `    const ext = item.file.name.split('.').pop() || 'mp4';
    const name = \`botock_editor_src_\${i}.\${ext}\`;`;
code = code.replace(/const name = \`botock_editor_src_\$\{i\}\.mp4\`;/, newFileNaming);


// Update video overlay iteration
const newVideoIteration = `  visibleVideoClips.forEach((clip, index) => {
    const inputIdx = sourceInputIndex.get(clip.sourceId)!;
    const res = buildClipVideoFilter(clip, inputIdx, \`v\${index}\`, targetW, targetH);
    filterParts.push(res.filterStr);
    filterParts.push(\`\${currentV}[v\${index}]overlay=x='\${res.overlayX}':y='\${res.overlayY}':eof_action=pass:enable='between(t,\${clip.timelineStart.toFixed(3)},\${(clip.timelineStart + clip.duration).toFixed(3)})'[bg\${index + 1}]\`);
    currentV = \`[bg\${index + 1}]\`;
  });`;
code = code.replace(/  allVideoClips\.forEach\(\(clip, index\) => \{[\s\S]*?currentV = \`\[bg\$\{index \+ 1\}\]\`;\n  \}\);/, newVideoIteration);

// Update audio iteration (allAudioSources is already filtered for trackMuted!)
// We can just use the exact logic previously there since allAudioSources logic was mostly identical, just replace the assignment:
code = code.replace(/  const allAudioSources = \[\.\.\.allVideoClips, \.\.\.allAudioClips\];\n  allAudioSources\.forEach/, '  allAudioSources.forEach');


fs.writeFileSync('frontend/lib/editor/exportTimeline.ts', code);
