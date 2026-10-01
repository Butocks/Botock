with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "r") as f:
    content = f.read()

bad_order = """  const timeRef = useRef(currentTime);

  const [currentTime, setCurrentTime] = useState(0);"""

good_order = """  const [currentTime, setCurrentTime] = useState(0);
  const timeRef = useRef(currentTime);"""

content = content.replace(bad_order, good_order)

with open("frontend/app/tools/video-editor/VideoEditorComponent.tsx", "w") as f:
    f.write(content)
