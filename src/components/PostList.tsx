/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BlogPost } from '../types';
import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PostListProps {
  posts: BlogPost[];
  selectedPostId: string | null;
  onSelectPost: (post: BlogPost) => void;
  onNewPost: () => void;
  isLoading: boolean;
  onStatusFilterChange: (filter: 'all' | 'live' | 'draft' | 'scheduled') => void;
  currentStatusFilter: 'all' | 'live' | 'draft' | 'scheduled';
}

export default function PostList({
  posts,
  selectedPostId,
  onSelectPost,
  onNewPost,
  isLoading,
  onStatusFilterChange,
  currentStatusFilter,
}: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Local Client-Side Searching on Post Titles + Content
  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'LIVE':
        return <CheckCircle size={12} className="text-emerald-500 shrink-0" />;
      case 'SCHEDULED':
        return <Clock size={12} className="text-blue-500 shrink-0" />;
      case 'DRAFT':
      default:
        return <AlertCircle size={12} className="text-amber-500 shrink-0" />;
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Search and Action Bar */}
      <div className="p-4 border-b border-gray-100 space-y-3 shrink-0 bg-gray-50/20">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">
            Blog Posts ({filteredPosts.length})
          </h3>
          <button
            onClick={onNewPost}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-100 hover:shadow-indigo-200 active:scale-[0.98] transition-all"
          >
            <Plus size={14} />
            <span>New Post</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1">
          <Filter size={12} className="text-gray-400 mr-1 shrink-0" />
          <div className="flex flex-wrap items-center gap-1 flex-1">
            {(['all', 'live', 'draft', 'scheduled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => onStatusFilterChange(filter)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
                  currentStatusFilter === filter
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts list container */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 p-3 border border-gray-50 rounded-xl">
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center space-y-3 text-gray-400 h-full flex flex-col justify-center items-center">
            <FileText size={32} className="text-gray-200" />
            <div className="space-y-1">
              <p className="font-semibold text-sm text-gray-500">No Posts Found</p>
              <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search terms or filter selection"
                  : "Start creating your first blog posts directly by clicking 'New Post'"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={onNewPost}
                className="px-4 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-xs rounded-xl transition-all"
              >
                Create a Post Now
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((post) => {
              const isSelected = post.id === selectedPostId;
              const formattedDate = post.updated
                ? new Date(post.updated).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '';

              return (
                <button
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`w-full text-left flex items-start gap-3 p-4 hover:bg-gray-50/50 transition-all border-l-4 text-sm focus:outline-none ${
                    isSelected
                      ? 'bg-indigo-50/40 border-l-indigo-600'
                      : 'border-l-transparent border-b border-b-gray-50'
                  }`}
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start gap-1.5">
                      {getStatusIcon(post.status)}
                      <h4 className={`font-semibold tracking-tight text-gray-800 line-clamp-2 leading-snug ${
                        isSelected ? 'text-indigo-900' : ''
                      }`}>
                        {post.title}
                      </h4>
                    </div>

                    {/* Labels */}
                    {post.labels && post.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-full">
                        {post.labels.slice(0, 3).map((l) => (
                          <span
                            key={l}
                            className="bg-gray-100/80 border border-gray-200/20 text-gray-500 text-[9px] font-bold px-1.5 py-0.2 rounded"
                          >
                            {l}
                          </span>
                        ))}
                        {post.labels.length > 3 && (
                          <span className="text-[9px] text-gray-400 font-bold self-center">
                            +{post.labels.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-0.5">
                      <span>{formattedDate}</span>
                      <span className={`px-1.5 py-0.2 rounded-full border text-[9px] font-bold ${
                        getStatusBadgeClass(post.status)
                      }`}>
                        {post.status || 'DRAFT'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className={`text-gray-300 self-center transition-transform duration-200 shrink-0 ${
                      isSelected ? 'text-indigo-400 translate-x-0.5' : 'group-hover:text-gray-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
