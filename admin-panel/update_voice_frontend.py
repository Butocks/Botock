import re

with open('frontend/app/tools/voice-changer/VoiceChangerClient.tsx', 'r') as f:
    content = f.read()

new_modes = """
const VOICE_MODES = [
  // Original
  { id: "kid", label: "👦 Kid" },
  { id: "little_girl", label: "👧 Little Girl" },
  { id: "women", label: "👩 Woman" },
  { id: "man_deep", label: "👨 Deep Voice Man" },
  { id: "deep_villain", label: "😈 Deep Villain" },
  { id: "man_old", label: "👴 Old Man" },
  { id: "old_women", label: "👵 Old Woman" },
  { id: "weak_man", label: "🤕 Weak Man" },
  { id: "strict", label: "👔 Strict/Bossy" },
  
  // AI Voice Filters (Requested)
  { id: "robot", label: "🤖 AI Robot" },
  { id: "chipmunk", label: "🐿️ Chipmunk" },
  { id: "echo_chamber", label: "⛰️ Echo Chamber" },
  { id: "telephone", label: "📞 Telephone" },
  
  // Privacy & Disguiser (Requested)
  { id: "privacy_disguiser", label: "🕵️ Privacy Disguiser" },
  
  // AI Voice Cloning Mock (Requested)
  { id: "clone_elon", label: "🚀 Elon (Clone)" },
  { id: "clone_morgan", label: "🎙️ Morgan (Clone)" },
  { id: "clone_anime_girl", label: "🌸 Anime Girl (Clone)" },
];
"""

content = re.sub(r'const VOICE_MODES = \[.*?\];', new_modes.strip(), content, flags=re.DOTALL)

with open('frontend/app/tools/voice-changer/VoiceChangerClient.tsx', 'w') as f:
    f.write(content)

