# Botock Video Studio - Phase 1

This is the first real editor rebuild for `/tools/video-editor`.

## Replace/add these files

- `frontend/app/tools/video-editor/VideoEditorComponent.tsx`
- `frontend/app/tools/video-editor/editorTypes.ts`
- `frontend/app/tools/video-editor/editorExport.ts`

The existing `page.tsx`, `useFFmpeg.ts`, and `ffmpegManager.ts` are intentionally reused.

## Phase 1 capabilities

- Professional NLE-style layout
- Media import
- Multiple clips on a timeline
- Clip selection
- Split
- Delete
- Duplicate
- Reorder
- Timeline zoom
- Playhead
- Keyboard shortcuts
- Undo/redo
- Trim in/out
- Playback speed
- Volume/mute
- Aspect ratios: 16:9, 9:16, 1:1, 4:5
- Rotation and zoom
- Color presets
- Local FFmpeg/WASM export for a single source clip
- No backend video upload/render service

## Important

The timeline already supports multiple clips, but the Phase 1 exporter deliberately renders one source clip at a time. Multi-source FFmpeg concat, image layers, audio tracks, transitions, text burn-in, captions, thumbnails and waveform rendering are Phase 2/3 work. This avoids pretending those features are implemented when they are not.

## Install

No new npm package is required. The implementation reuses Botock's existing `@ffmpeg/ffmpeg`, `@ffmpeg/core`, `@ffmpeg/util`, React, Zustand and Lucide dependencies.

## Test

From `frontend`:

```bash
npm run lint
npm run build
```

Then open:

`/tools/video-editor`
