import re

with open("frontend/app/page.tsx", "r") as f:
    content = f.read()

# Replace Services Teaser with Top Blogs and Modern CTA
services_teaser_pattern = re.compile(r"\{\/\* 7\. Services Teaser \*\/}.*?<\/section>", re.DOTALL)

new_sections = """{/* 7. Top Blogs & Guides */}
      <section className="py-16 bg-slate-50/50 dark:bg-[#0a0a0e] border-t border-slate-200 dark:border-white/[0.06] transition-colors">
        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Knowledge Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Latest Guides & Tutorials
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Articles →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "guide-to-ai-video-generation", title: "The Ultimate Guide to AI Video Generation", desc: "Learn the secrets of Text-to-Video and Image-to-Video. Discover how to write the perfect prompt...", date: "Oct 4, 2026", cat: "AI Studio", color: "text-violet-500 border-violet-500/20 bg-violet-500/10" },
              { id: "guide-to-photo-generation-and-faq", title: "Mastering AI Photo Generation", desc: "Everything you need to know about generating stunning images, understanding system speeds...", date: "Oct 4, 2026", cat: "Image Generation", color: "text-amber-500 border-amber-500/20 bg-amber-500/10" },
              { id: "guide-to-pdf-and-document-tools", title: "Streamlining Workflow with PDF Tools", desc: "Learn how to secure, unlock, and split PDF documents directly inside your Botock creative workspace.", date: "Oct 4, 2026", cat: "Productivity", color: "text-rose-500 border-rose-500/20 bg-rose-500/10" },
            ].map(b => (
              <Link key={b.id} href={`/blog/${b.id}`} className="block rounded-2xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.08] p-6 hover:border-violet-500/40 transition-all hover:shadow-lg group">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${b.color}`}>{b.cat}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{b.date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{b.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{b.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Modern CTA Banner */}
      <section className="py-20 bg-white dark:bg-[#09090b] transition-colors">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-900 dark:to-indigo-950 px-6 py-16 sm:px-16 text-center shadow-2xl border border-violet-500/20">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                Start 100% Free. Upgrade for Commercial Power.
              </h2>
              <p className="text-sm sm:text-base text-violet-100/90 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                All 100+ utilities are free forever. Only upgrade when you need priority queues, 720p HD video renders, and unlimited generative AI studio access.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/services"
                  className="px-8 py-4 rounded-xl bg-white text-violet-900 hover:bg-slate-50 font-black text-sm transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl"
                >
                  View Pro Plans
                </Link>
                <Link
                  href="/tools"
                  className="px-8 py-4 rounded-xl bg-violet-800/50 hover:bg-violet-800 text-white border border-violet-400/30 font-bold text-sm transition-all shadow-lg hover:-translate-y-1 backdrop-blur-sm"
                >
                  Explore 100+ Free Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>"""

content = re.sub(services_teaser_pattern, new_sections, content)

with open("frontend/app/page.tsx", "w") as f:
    f.write(content)

