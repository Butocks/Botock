# Context: Challenger 1

Role: Empirical adversarial challenger.
Working directory: /home/mir/Documents/botock/.agents/teamwork_preview_challenger_1/
Project root: /home/mir/Documents/botock
Frontend root: /home/mir/Documents/botock/frontend
Mandatory request file: /home/mir/Documents/botock/.agents/ORIGINAL_REQUEST.md
Test suite readiness: /home/mir/Documents/botock/.agents/TEST_READY.md
Project plan: /home/mir/Documents/botock/.agents/PROJECT.md

Task:
Empirically stress-test the 5 client-side image processing tools:
1. Test algorithmic correctness of image transformations:
   - Resizer: aspect ratio calculations, scale factor precision.
   - Compressor: file size calculation, reduction ratio.
   - WebP converter: Canvas toBlob format encoding, quality bounds.
   - Upscaler: multi-pass dimensions calculation, unsharp mask kernel convolution bounds.
   - Background remover: model loading configurations and asset options.
2. Run empirical checks and write results to `/home/mir/Documents/botock/.agents/teamwork_preview_challenger_1/handoff.md`.
3. State verdict: APPROVE or REJECT.
