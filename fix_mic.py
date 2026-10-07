import re
with open('frontend/app/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import {',
    'import { Mic,',
    1
)

with open('frontend/app/components/Navbar.tsx', 'w') as f:
    f.write(content)
