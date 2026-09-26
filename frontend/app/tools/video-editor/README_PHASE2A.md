# Botock Video Studio - Phase 2A

Replace these files:

- `frontend/app/tools/video-editor/VideoEditorComponent.tsx`
- `frontend/app/tools/video-editor/editorTypes.ts`
- `frontend/app/tools/video-editor/editorExport.ts`
- Add `frontend/app/tools/video-editor/editorFFmpeg.ts`

## What this phase adds

- Real multi-source FFmpeg render for the video timeline.
- Correct trim ranges for every source clip.
- Reordered/split/duplicated clips render in timeline order.
- Correct chained `atempo` filters for 0.25x through 4x speed.
- Audio volume and mute handling.
- Silent-sequence export without inventing an audio track.
- Color filters, brightness, contrast, saturation, rotation, zoom and aspect output are applied during the final render.
- Undo/redo now preserves the original `Blob`/`File` references instead of losing them through JSON cloning.
- FFmpeg progress is shown through the editor export UI.

## Important

`editorFFmpeg.ts` uses the existing `@ffmpeg/ffmpeg` + `@ffmpeg/util` packages and loads the matching FFmpeg core from jsDelivr on first render. No video is uploaded to Botock's backend.

Mixed sequences where some clips have audio and others are silent are intentionally blocked in this phase rather than producing an incorrectly synchronized export. Re-import those clips after the audio-track detection update, or use a sequence where all clips have the same audio state.

Run from `frontend`:

```bash
npm run lint
npm run build
```
