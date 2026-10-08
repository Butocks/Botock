with open('frontend/app/terms/page.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(
    r'Our online tools are 100% free of charge and require no sign-up or registration\..*?under your account\.',
    'Our online tools are 100% free of charge and require no sign-up or registration. You can access and use our utilities immediately without creating an account.',
    content, flags=re.DOTALL
)

with open('frontend/app/terms/page.tsx', 'w') as f:
    f.write(content)
