import re

with open('frontend/app/tools/ToolsDirectoryClient.tsx', 'r') as f:
    content = f.read()

new_tools = """
  // Advanced AI Features
  {
    id: "video-remove-bg",
    name: "AI Video BG Remover",
    desc: "Instantly remove backgrounds, apply Smart Cutout & AI Green Screen.",
    category: "ai",
    href: "/tools/video-remove-bg",
    icon: Scissors,
  },
  {
    id: "audio-enhance",
    name: "AI Audio Enhancer",
    desc: "Remove background noise and apply studio-quality speech enhancement.",
    category: "ai",
    href: "/tools/audio-enhance",
    icon: Music,
  },
  {
    id: "auto-reframe",
    name: "AI Auto-Reframe",
    desc: "Automatically crop and track subjects to convert horizontal videos to 9:16 Shorts.",
    category: "ai",
    href: "/tools/video-auto-reframe",
    icon: Maximize2,
  },
  {
    id: "voice-changer-advanced",
    name: "AI Voice Changer",
    desc: "Transform voices with AI filters (Robot, Clone, Disguiser) & pitch shifting.",
    category: "ai",
    href: "/tools/voice-changer",
    icon: Music,
  },
  
  // 1. AI Creative Suite
"""

content = content.replace("// 1. AI Creative Suite", new_tools.strip())

with open('frontend/app/tools/ToolsDirectoryClient.tsx', 'w') as f:
    f.write(content)

