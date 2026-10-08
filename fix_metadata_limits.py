import glob

files = glob.glob('frontend/app/tools/*/page.tsx')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    original = content
    content = content.replace("free daily credits", "completely free and unlimited")
    content = content.replace("free daily quotas", "completely free and unlimited")
    content = content.replace("3 free videos", "unlimited free videos")
    content = content.replace("5 free images", "unlimited free images")
    content = content.replace("daily limits", "no limits")
    
    if content != original:
        with open(f, 'w') as file:
            file.write(content)
            print(f"Updated metadata limits in {f}")
