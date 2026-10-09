const fs = require('fs');
let code = fs.readFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', 'utf8');

const oldEye = `<button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>`;
const newEye = `<button onClick={() => window.dispatchEvent(new CustomEvent('editor-update-track', { detail: { id: track.id, hidden: !track.hidden } }))} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>`;
code = code.replace(oldEye, newEye);

const oldLock = `<button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>`;
const newLock = `<button onClick={() => window.dispatchEvent(new CustomEvent('editor-update-track', { detail: { id: track.id, locked: !track.locked } }))} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>`;
code = code.replace(oldLock, newLock);

const oldMute = `<button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>`;
const newMute = `<button onClick={() => window.dispatchEvent(new CustomEvent('editor-update-track', { detail: { id: track.id, isMuted: !track.isMuted } }))} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
              {track.isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>`;
code = code.replace(oldMute, newMute);

fs.writeFileSync('frontend/app/tools/video-editor/components/EditorTimeline.tsx', code);
