import glob
import re

files = glob.glob('frontend/app/tools/*/page.tsx')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    original = content
    # Remove mentions of limits and sign up
    content = re.sub(r'3 free video clips daily, refreshed automatically every 24 hours', 'unlimited free video clips daily, with absolutely no charges', content)
    content = re.sub(r'5 free high-resolution image generations every 24 hours', 'unlimited free high-resolution image generations with no restrictions', content)
    content = re.sub(r'every registered user receives', 'every user receives', content, flags=re.IGNORECASE)
    content = re.sub(r'Registered users get', 'Users get', content, flags=re.IGNORECASE)
    content = re.sub(r'3 Free Daily Clips', 'Unlimited Free Video Generation', content, flags=re.IGNORECASE)
    
    if content != original:
        with open(f, 'w') as file:
            file.write(content)
            print(f"Updated {f}")
