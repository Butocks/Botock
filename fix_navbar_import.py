import re
with open('frontend/app/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'import \{\s*(.*?)\s*\} from "lucide-react";',
    r'import { \1, Mic } from "lucide-react";',
    content,
    count=1
)

with open('frontend/app/components/Navbar.tsx', 'w') as f:
    f.write(content)
print("Fixed import")
