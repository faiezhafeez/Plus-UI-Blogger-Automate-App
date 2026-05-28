/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Blog } from '../types';
import { Layers, ChevronRight, ExternalLink, Rss } from 'lucide-react';

interface BlogSelectorProps {
  blogs: Blog[];
  selectedBlogId: string | null;
  onSelectBlog: (blogId: string) => void;
  isLoading: boolean;
  blogsError?: string | null;
  onRetry?: () => void;
}

export default function BlogSelector({
  blogs,
  selectedBlogId,
  onSelectBlog,
  isLoading,
  blogsError,
  onRetry,
}: BlogSelectorProps) {

  if (isLoading) {
    return (
      <div className="space-y-2 p-1 animate-pulse">
        <div className="h-4 bg-gray-250 rounded w-1/3 mb-4" />
        <div className="h-14 bg-gray-800 rounded-xl" />
        <div className="h-14 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (blogsError) {
    const isBloggerDisabled = blogsError.toLowerCase().includes('blogger api has not been used') || 
                              blogsError.toLowerCase().includes('disabled');
    const matchUrl = blogsError.match(/https?:\/\/[^\s]+/);
    const linkUrl = matchUrl ? matchUrl[0].replace(/[.,;:)]+$/, '') : 'https://console.developers.google.com/apis/api/blogger.googleapis.com/overview?project=967372402702';

    return (
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-100 space-y-3.5 shadow-lg">
        <div className="flex items-center gap-2 text-red-400">
          <Rss size={16} className="shrink-0 animate-pulse text-red-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider">Blogger API disabled</h4>
        </div>
        
        {isBloggerDisabled ? (
          <div className="space-y-3">
            <p className="text-[11px] text-red-300 leading-relaxed font-semibold">
              The Google Blogger API has not been enabled on this Google Cloud Project yet. Click the link below to open the console and enable it.
            </p>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-650 hover:bg-red-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md transition-all select-none"
            >
              <span>Enable Blogger API</span>
              <ExternalLink size={12} />
            </a>
            <p className="text-[9px] text-slate-400 leading-normal italic">
              Once you have clicked "Enable", wait about 1 minute for propagation, and then click below to refresh.
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-red-350 leading-relaxed font-mono whitespace-pre-wrap break-all p-2 rounded-lg border border-red-950 bg-black/40">
            {blogsError}
          </p>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
          >
            Check Again / Reload
          </button>
        )}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center text-amber-800 space-y-2">
        <Rss size={24} className="mx-auto text-amber-500" />
        <h4 className="font-semibold text-sm">No Blogs Found</h4>
        <p className="text-xs text-amber-600/95 leading-relaxed">
          We couldn't find any blogs on this Google account. Create a blog on Blogger to get started.
        </p>
        <a
          href="https://www.blogger.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors mt-2"
        >
          <span>Create a Blog on Blogger</span>
          <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Layers size={14} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Blogs List ({blogs.length})
        </span>
      </div>

      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
        {blogs.map((blog) => {
          const isSelected = blog.id === selectedBlogId;
          return (
            <button
              key={blog.id}
              onClick={() => onSelectBlog(blog.id)}
              className={`w-full text-left flex items-start justify-between gap-3 p-3.5 rounded-xl border text-sm transition-all focus:outline-none ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-700'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold block truncate">
                  {blog.name}
                </span>
                <span className="text-xs text-gray-400 block truncate">
                  {blog.posts?.totalItems || 0} {blog.posts?.totalItems === 1 ? 'post' : 'posts'}
                </span>
              </div>

              <div className="flex items-center gap-2shrink-0">
                {blog.url && (
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`p-1.5 rounded-md transition-colors ${
                      isSelected
                        ? 'text-indigo-500 hover:bg-indigo-100/50'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title="View public Blogger site"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <ChevronRight
                  size={15}
                  className={`transition-transform duration-200 ${
                    isSelected ? 'text-indigo-500 translate-x-0.5' : 'text-gray-400'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
