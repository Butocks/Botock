with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

# Replace the incorrect sequence
bad_seq = """             </div>
          </div>


             {/* Inspector Area */}"""
good_seq = """             </div>


             {/* Inspector Area */}"""

content = content.replace(bad_seq, good_seq)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
