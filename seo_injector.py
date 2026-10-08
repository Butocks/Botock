import glob
import re

files = glob.glob('frontend/app/tools/*/page.tsx')

def get_tool_name(content):
    # Try to find H1
    h1_match = re.search(r'<h1[^>]*>\s*(.*?)\s*</h1>', content, re.DOTALL)
    if h1_match:
        # remove inner tags
        return re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
    return "This Tool"

for f in files:
    with open(f, 'r') as file:
        content = file.read()
        
    if "Frequently Asked Questions" in content:
        continue # Already has deep SEO
        
    tool_name = get_tool_name(content)
    
    seo_block = f"""
      {{/* --- Enterprise SEO Content --- */}}
      <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              The Best Free {tool_name} Online
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Experience the fastest and most secure way to use our <strong>{tool_name}</strong>. Botock AI provides unlimited access with absolutely no charges, no hidden fees, and no sign-up required. Your privacy is our priority—all processing happens directly in your browser, ensuring your files are never uploaded to any remote servers. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">100% Free of Cost</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enjoy unlimited usage without ever pulling out your credit card. We believe premium tools should be accessible to everyone, completely free of charge.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Sign-Up Required</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Skip the tedious registration process. You don't need to create an account or provide your email address to access our full suite of features.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Absolute Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We use cutting-edge client-side rendering technology. This means your files stay on your device and are processed locally, guaranteeing zero data retention.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Is {tool_name} really free to use?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Yes! Our {tool_name} is completely free of cost. There are no hidden charges, no trial periods, and no watermarks placed on your final output.
                </p>
              </details>
              <details className="group border border-slate-200 dark:border-white/[0.05] rounded-xl bg-white dark:bg-[#141419] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-slate-900 dark:text-white font-semibold">
                  Do I need to create an account?
                </summary>
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No sign-up is required. You can start using the {tool_name} immediately without logging in or providing any personal information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
"""

    # Insert it. 
    # Attempt 1: Before {/* Related Tools
    if '{/* Related Tools' in content:
        content = content.replace('{/* Related Tools', seo_block + '\n      {/* Related Tools')
    else:
        # Attempt 2: Find the last closing tag.
        # usually `    </div>\n  );\n}`
        # Wait, if it's not a generic file, it might be different. Let's just use regex to replace `  );\n}` with `\n` + seo_block + `\n  );\n}` Wait no, it has to be inside the outermost div!
        # Find the last `</div>` before `  );`
        match = re.search(r'(.*)(</div>\s*)\);\s*}', content, re.DOTALL)
        if match:
            content = match.group(1) + seo_block + "\n" + match.group(2) + ");\n}"
        else:
            print(f"COULD NOT INJECT INTO {f}")
            continue

    with open(f, 'w') as file:
        file.write(content)
        print(f"Added SEO to {f}")

