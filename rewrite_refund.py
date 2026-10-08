with open('frontend/app/refund/page.tsx', 'r') as f:
    content = f.read()

# Replace Section 1 entirely
import re
new_section_1 = """
          {/* Section 1: 100% Free Platform */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/[0.08] pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2>1. Free Online Tools (No Subscriptions)</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Botock AI provides its entire suite of online utilities—including AI Video Generation, AI Photo Generation, and all document tools—completely <strong>free of charge</strong>. 
              We do not sell subscriptions, we do not require credit cards for our online platform, and there are no hidden fees. Because our online platform is 100% free, there are no refunds applicable for web users.
            </p>
          </section>
"""

content = re.sub(r'\{\/\* Section 1: Platform Subscriptions & Automated AI Credits \*\/\}.*?(?=\{\/\* Section 2:)', new_section_1, content, flags=re.DOTALL)

with open('frontend/app/refund/page.tsx', 'w') as f:
    f.write(content)
