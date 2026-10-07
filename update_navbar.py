with open('frontend/app/components/Navbar.tsx', 'r') as f:
    content = f.read()

new_link = """
                      <Link
                        href="/tools/voice-changer"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                            AI Voice Changer
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Transform audio pitch, tone, and character
                          </p>
                        </div>
                      </Link>
"""

content = content.replace('                    {/* Image Studio */}', new_link + '\n                    {/* Image Studio */}')

with open('frontend/app/components/Navbar.tsx', 'w') as f:
    f.write(content)
print("Updated Navbar!")
