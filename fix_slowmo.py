with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "r") as f:
    content = f.read()

import re

# Fix 1: Relax the drift threshold massively during playback to stop backward-seeking slow-mo effect
content = content.replace(
    'const maxDrift = playing ? 0.25 : 0.05;',
    'const maxDrift = playing ? 1.5 : 0.05;'
)

# Fix 2: Append videos to a hidden DOM element so the browser doesn't throttle offscreen decoding
if 'const poolRef = useRef<HTMLDivElement>(null);' not in content:
    content = content.replace(
        '  const canvasRef = useRef<HTMLCanvasElement>(null);',
        '  const canvasRef = useRef<HTMLCanvasElement>(null);\n  const poolRef = useRef<HTMLDivElement>(null);'
    )

    # Append created video to pool
    content = content.replace(
        'mediaPool.current[c.id] = v; v.load();',
        'mediaPool.current[c.id] = v;\n                if (poolRef.current) poolRef.current.appendChild(v);\n                v.load();'
    )

    # Clean up video from pool when deleted
    content = content.replace(
        'delete mediaPool.current[clipId];',
        'if (el.parentNode) el.parentNode.removeChild(el);\n          delete mediaPool.current[clipId];'
    )

    # Render the hidden pool div next to the canvas
    content = content.replace(
        'return (\n    <canvas',
        'return (\n    <>\n      <div ref={poolRef} className="hidden" style={{ display: "none" }} />\n      <canvas'
    )

    content = content.replace(
        '    />\n  );\n}',
        '    />\n    </>\n  );\n}'
    )

with open("frontend/app/tools/video-editor/components/PreviewCanvas.tsx", "w") as f:
    f.write(content)
