with open('frontend/app/terms/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Certain advanced generative features and quota allocations require account registration.',
    'Our online tools are 100% free of charge and require no sign-up or registration.'
)
content = content.replace(
    'Attempt to reverse-engineer, exploit, or bypass platform quota enforcement or security controls.',
    'Attempt to reverse-engineer, exploit, or bypass platform security controls.'
)

import re
new_payment_section = """
            <p>
              Botock AI's online tools are provided completely free of charge. We do not sell platform credits, generative tokens, or subscriptions. For our enterprise clients who engage us for custom digital development services, payments are governed by our formal{" "}
              <Link href="/refund" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                Refund &amp; Cancellation Policy
              </Link>
              .
            </p>
"""
content = re.sub(r'<p>\s*All purchases of platform credits.*?non-refundable\.\s*</p>', new_payment_section.strip(), content, flags=re.DOTALL)

with open('frontend/app/terms/page.tsx', 'w') as f:
    f.write(content)
