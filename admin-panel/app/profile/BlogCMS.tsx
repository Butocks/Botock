"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { getBackendUrl } from "../../utils/runtime-urls";
import { 
  FileText, Plus, Trash2, Edit3, Settings, Save, CheckCircle2, Search, Link as LinkIcon, AlertTriangle
} from "lucide-react";

export default function BlogCMS() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);
  
  const [view, setView] = useState<"list"|"edit">("list");
  const [editingPost, setEditingPost] = useState<any>(null);

  const supabase = createClient();

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    
    try {
      const res = await fetch(`${await getBackendUrl()}/api/cms/posts`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!editingPost.title || !editingPost.slug || !editingPost.content) {
      showToast("Title, slug, and content are required.", "error");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const isUpdate = !!editingPost.id;
      const url = `${await getBackendUrl()}/api/cms/posts${isUpdate ? `/${editingPost.id}` : ""}`;
      const method = isUpdate ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingPost)
      });
      
      if (res.ok) {
        showToast(`Post ${isUpdate ? "updated" : "created"} successfully!`);
        setView("list");
        fetchPosts();
      } else {
        const data = await res.json();
        showToast(data.detail || "Failed to save post", "error");
      }
    } catch (e) {
      showToast("Error saving post", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${await getBackendUrl()}/api/cms/posts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        showToast("Post deleted");
        fetchPosts();
      }
    } catch (e) {
      showToast("Error deleting post", "error");
    }
  };

  const openEditor = (post: any = null) => {
    if (post) {
      setEditingPost({ ...post });
    } else {
      setEditingPost({
        title: "", slug: "", h1: "", content: "", excerpt: "", featured_image: "", 
        content_cluster: "", meta_title: "", meta_description: "", canonical_url: "", 
        is_indexable: true, primary_keyword: "", status: "DRAFT"
      });
    }
    setView("edit");
  };

  if (view === "edit") {
    return (
      <div className="space-y-6 animate-fade-in text-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{editingPost.id ? "Edit Post" : "Create New Post"}</h2>
            <p className="text-xs text-slate-400 mt-1">Status: {editingPost.status}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Content Editor</h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input type="text" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" placeholder="e.g. 5 AI Video Trends" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">H1 Heading (Optional, defaults to Title)</label>
                <input type="text" value={editingPost.h1 || ""} onChange={e => setEditingPost({...editingPost, h1: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Featured Image URL</label>
                <input type="text" value={editingPost.featured_image || ""} onChange={e => setEditingPost({...editingPost, featured_image: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" placeholder="https://..." />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Markdown Content</label>
                <textarea rows={16} value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm font-mono leading-relaxed" placeholder="# Heading 1\n\nWrite your markdown here..." />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Excerpt (Summary)</label>
                <textarea rows={3} value={editingPost.excerpt || ""} onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#111116] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">SEO & Settings</h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Slug</label>
                <input type="text" value={editingPost.slug} onChange={e => setEditingPost({...editingPost, slug: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" placeholder="e.g. 5-ai-video-trends" />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Status</label>
                <select value={editingPost.status} onChange={e => setEditingPost({...editingPost, status: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PLANNED">PLANNED</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="READY">READY</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="NEEDS_UPDATE">NEEDS_UPDATE</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Parent Post (Hierarchy)</label>
                <select value={editingPost.parent_id || ""} onChange={e => setEditingPost({...editingPost, parent_id: e.target.value || null})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm">
                  <option value="">-- None (Top Level) --</option>
                  {posts.filter(p => p.id !== editingPost.id).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Primary Keyword</label>
                <input type="text" value={editingPost.primary_keyword || ""} onChange={e => setEditingPost({...editingPost, primary_keyword: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Content Cluster</label>
                <input type="text" value={editingPost.content_cluster || ""} onChange={e => setEditingPost({...editingPost, content_cluster: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" placeholder="e.g. AI Video Generation" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Title</label>
                <input type="text" value={editingPost.meta_title || ""} onChange={e => setEditingPost({...editingPost, meta_title: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Meta Description</label>
                <textarea rows={3} value={editingPost.meta_description || ""} onChange={e => setEditingPost({...editingPost, meta_description: e.target.value})} className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded-xl text-sm" />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={editingPost.is_indexable} onChange={e => setEditingPost({...editingPost, is_indexable: e.target.checked})} id="idx" />
                <label htmlFor="idx" className="text-sm font-semibold">Allow Search Engine Indexing (is_indexable)</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xl ${toast.type === "error" ? "bg-red-500/20 border-red-500/40 text-red-200" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"}`}>
          {toast.type === "error" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Knowledge Hub CMS</h2>
          <p className="text-xs text-slate-400 mt-1">Manage educational pages, blog posts, and site hierarchy.</p>
        </div>
        <button onClick={() => openEditor()} className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["PUBLISHED", "DRAFT", "REVIEW", "NEEDS_UPDATE"].map(status => (
          <div key={status} className="p-4 rounded-xl bg-[#111116] border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">{status}</span>
            <span className="text-2xl font-black text-white">{posts.filter(p => p.status === status).length}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#111116] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Content</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search by title..." className="pl-9 pr-3 py-1.5 text-xs bg-black border border-slate-700 rounded-lg w-48 text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Title & Slug</th>
                <th className="p-3">Cluster</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="font-bold text-sm text-white mb-0.5">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">/{p.slug}</div>
                  </td>
                  <td className="p-3 text-slate-400">{p.content_cluster || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => openEditor(p)} className="p-1.5 hover:bg-white/10 rounded text-sky-400 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-white/10 rounded text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No content found. Create your first article!</td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Loading CMS data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
